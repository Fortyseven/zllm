<script>
    import { createEventDispatcher } from "svelte";
    // import ollama from "ollama/browser";

    import { buffered_output } from "../../stores";
    import { OL_chat } from "../../api";
    import { writable } from "svelte/store";

    const SYSTEM_PROMPT = `
    You are playing a game of Zork, an interactive text adventure. The user will provide the game history in the form of JSON objects including your move, and the response it gave.

    You are to respond ONLY with a JSON object containing what your next move is based on that information.

    The game is simple. You must provide a single verb, with an optional noun that you can leave blank if makes sense to omit it; but you should always try to specify what you want to use the verb against. You must also provide a reason for the choice you have made. Try to use the game's history to make a reasonable choice of response

    Basic verbs include, but are not limited to: take, drop, look, examine, inventory, eat, shout, read, open, close, north, west, east, south.

    If the game does not seem to understand you, try using a different verb.

    Do not do the same thing over and over. Always explore.

    You MUST return your response as a JSON object in the following format:
    {"verb": "$VERB","noun": "$NOUN","reason": "$REASON"}

    History:
    `.trim();

    let game_history = writable([]);
    let last_move = "";
    let last_reason = "";

    let log_request = [];
    let log_response;

    const dispatch = createEventDispatcher();

    $: if ($buffered_output) {
        $game_history = [
            ...$game_history,
            { response: $buffered_output, move: last_move },
        ];
    }

    function focus(node) {
        node.focus();
    }

    function getHistory() {
        const hist = $game_history
            .filter((item) => item.response)
            .map((item) =>
                JSON.stringify(item).replaceAll(">", "").replaceAll("\\n", "\n")
            );

        // return the last 10 items

        return hist.slice(-25);
    }

    async function onNextMove() {
        const response = await OL_chat(SYSTEM_PROMPT, getHistory());

        log_request = getHistory() || [];

        let response_text = response.message.content;

        log_response = response_text;

        // if there's any JSON in the response, extract it, because LLMs don't
        // fucking listen often enough.
        let json_match = response_text.match(
            /{\s*"[^"]*"\s*:\s*("[^"]*"|true|false|null|[0-9]+(\.[0-9]+)?)(\s*,\s*"[^"]*"\s*:\s*("[^"]*"|true|false|null|[0-9]+(\.[0-9]+)?))*\s*}/g
        );
        if (json_match === null) {
            console.error("No JSON object found in response", response_text);
            return;
        }

        console.log("OL_RESPONSE", JSON.parse(json_match));
        const next_move = JSON.parse(json_match);
        last_move = `${next_move.verb} ${next_move?.noun || ""}`.trim();
        last_reason = next_move?.reason;
        dispatch("zinput", last_move);
    }
</script>

<div class="controls">
    <button on:click={onNextMove}>Next move</button>
</div>

<div class="thinking">
    <div>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>last move:</label>
        <div class="move">{last_move || "--"}</div>
    </div>
    <div>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>reason:</label>
        <div class="reason">{last_reason || "--"}</div>
    </div>
    <div class="meta">
        <div class="history">
            {#each $game_history as item}
                <div class="history-row">
                    <div class="hist-move">{item.move || "--"}</div>
                    <div class="hist-response">{item.response || "--"}</div>
                </div>
            {/each}
        </div>
        <div class="response">{log_response}</div>
    </div>
</div>

<style lang="scss">
    div.controls {
        text-align: center;
    }

    .thinking {
        .reason,
        .move {
            padding: 0.5em 1em;
            margin: 0;
            background: black;
            color: #fb0;
            border-radius: 10px;
        }

        .reason {
            color: white;
        }

        label {
            font-weight: bold;
        }
    }

    div.meta {
        /* border: 1px solid red; */
        gap: 1em;
        display: flex;
        flex-direction: row;
        height: 350px;
        padding: 1em 0;

        div.history,
        div.response {
            flex: 50%;
            padding: 0.25em 1em;
            overflow-y: scroll;
            background: black;
            font-family: monospace;
            font-size: 12pt;
            color: #4f4;
            line-height: 1.2em;
        }

        div.history {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            font-size: 9pt;
            overflow-y: scroll;
            .history-row {
                display: flex;
                flex-direction: row;
                gap: 1em;

                .hist-move {
                    // border: 1px solid red;
                    color: white;
                    flex-shrink: 1;
                    flex-grow: 0;
                    flex: auto;
                }
                .hist-response {
                    // border: 1px solid blue;
                    color: cyan;
                    flex: auto;
                }
            }
        }
    }

    // div.meta div.history {
    //     display: flex;
    //     flex-direction: row;
    //     justify-content: space-between;
    //     padding: 0.25em 0;
    //     .history-row {
    //         //
    //     }
    // }
</style>
