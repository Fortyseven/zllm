export async function OL_chat(system_prompt, user_messages) {
    const body = {
        model: "llama3:latest",
        stream: false,
        messages: [
            {
                role: "system",
                content: system_prompt,
            },
        ],
        options: {
            num_ctx: 8192,
            repeat_penalty: 1.2,
            temperature: 0.8,
        },
    };

    for (let i = 0; i < user_messages.length; i++) {
        body.messages.push({
            role: "user",
            content: user_messages[i],
        });
    }

    const inferenceResponse = await fetch(`http://localhost:11434/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    return inferenceResponse.json();
}
