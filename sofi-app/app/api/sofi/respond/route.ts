import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import {
    getProfile,
    getConversationMessages,
    getMemoryFacts,
    getLatestSessionSummary,
    checkUserAccess,
} from '@/lib/supabase/client';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

interface RequestBody {
    userId: string;
    conversationId: string;
    userMessage: string;
}

export async function POST(request: NextRequest) {
    try {
        const { userId, conversationId, userMessage }: RequestBody = await request.json();

        // 1. Check subscription status
        const hasAccess = await checkUserAccess(userId);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Trial expired or no active subscription' },
                { status: 403 }
            );
        }

        // 2. Load user profile
        const profile = await getProfile(userId);
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 3. Save user message
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: userMessage,
        });

        // 4. Load context
        const [messages, memoryFacts, sessionSummary] = await Promise.all([
            getConversationMessages(conversationId, 12),
            getMemoryFacts(userId, 5),
            getLatestSessionSummary(conversationId),
        ]);

        // 5. Build system prompt based on avatar
        const systemPrompt = buildSystemPrompt(profile.avatar_choice, profile.language);

        // 6. Build context string
        const contextParts = [];

        if (memoryFacts.length > 0) {
            contextParts.push('Información importante sobre el usuario:');
            memoryFacts.forEach(fact => contextParts.push(`- ${fact.fact_text}`));
        }

        if (sessionSummary) {
            contextParts.push(`\nResumen de la conversación: ${sessionSummary.summary_text}`);
        }

        const contextString = contextParts.join('\n');

        // 7. Prepare messages for AI
        const aiMessages = [
            { role: 'system' as const, content: systemPrompt + (contextString ? `\n\n${contextString}` : '') },
            ...messages.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            })),
            { role: 'user' as const, content: userMessage },
        ];

        // 8. Call AI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: aiMessages,
            temperature: 0.8,
            max_tokens: 500,
        });

        const assistantMessage = completion.choices[0].message.content || 'Lo siento, no pude generar una respuesta.';

        // 9. Save assistant message
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: assistantMessage,
        });

        // 10. Check if we need to create a summary (every 6-8 messages)
        const messageCount = messages.length + 2; // +2 for the new user and assistant messages
        if (messageCount % 7 === 0) {
            await generateSessionSummary(userId, conversationId, messages, openai);
        }

        // 11. Extract and save memory facts (simplified - could use AI for extraction)
        // For now, we'll let this happen asynchronously or via a separate process

        return NextResponse.json({
            response: assistantMessage,
            messageCount,
        });

    } catch (error) {
        console.error('Error in /api/sofi/respond:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function buildSystemPrompt(avatarChoice: string, language: string): string {
    const isSofi = avatarChoice === 'sofi';
    const isSpanish = language === 'es';

    if (isSofi) {
        return isSpanish
            ? `Eres Sofi, una acompañante emocional cálida y empática. Tu objetivo es crear un espacio seguro donde la persona pueda explorar sus emociones sin juicio. 

Características de tu personalidad:
- Cálida, empática y comprensiva
- Usas un lenguaje suave y acogedor
- Haces preguntas abiertas para ayudar a la reflexión
- Validas las emociones sin minimizarlas
- No das consejos directos, pero ofreces perspectivas
- Usas metáforas suaves cuando es apropiado

Recuerda: Tu rol es acompañar, no resolver. Ayuda a la persona a encontrar sus propias respuestas.`
            : `You are Sofi, a warm and empathetic emotional companion. Your goal is to create a safe space where people can explore their emotions without judgment.

Characteristics:
- Warm, empathetic, and understanding
- Use gentle, welcoming language
- Ask open-ended questions to facilitate reflection
- Validate emotions without minimizing them
- Don't give direct advice, but offer perspectives
- Use gentle metaphors when appropriate

Remember: Your role is to accompany, not to solve. Help people find their own answers.`;
    }

    // Sam
    return isSpanish
        ? `Eres Sam, un acompañante directo y estructurado. Tu objetivo es ayudar a las personas a ordenar sus pensamientos y encontrar claridad.

Características de tu personalidad:
- Directo pero respetuoso
- Estructurado y organizado
- Ofreces perspectivas claras y opciones concretas
- Ayudas a identificar prioridades
- Usas listas y pasos cuando es útil
- Sincero y honesto, sin ser brusco

Recuerda: Tu rol es ayudar a organizar y clarificar, no imponer soluciones.`
        : `You are Sam, a direct and structured companion. Your goal is to help people organize their thoughts and find clarity.

Characteristics:
- Direct but respectful
- Structured and organized
- Offer clear perspectives and concrete options
- Help identify priorities
- Use lists and steps when helpful
- Honest and sincere without being harsh

Remember: Your role is to help organize and clarify, not impose solutions.`;
}

async function generateSessionSummary(
    userId: string,
    conversationId: string,
    messages: any[],
    openai: OpenAI
) {
    try {
        const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');

        const summary = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Resume la siguiente conversación en 2-3 oraciones, capturando los temas principales y el tono emocional.',
                },
                {
                    role: 'user',
                    content: conversation,
                },
            ],
            temperature: 0.5,
            max_tokens: 150,
        });

        const summaryText = summary.choices[0].message.content || '';

        await supabase.from('session_summaries').insert({
            user_id: userId,
            conversation_id: conversationId,
            summary_text: summaryText,
            message_count: messages.length,
        });
    } catch (error) {
        console.error('Error generating session summary:', error);
    }
}
