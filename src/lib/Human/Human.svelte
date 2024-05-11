<script>
    import { createEventDispatcher } from "svelte";
    import { buffered_output } from "../../stores";

    let input = "";
    let last_cmd = "";
    let inputEl;

    const dispatch = createEventDispatcher();

    buffered_output.subscribe((value) => {
        console.log("output:", value);
    });

    function onSubmit(event) {
        event.preventDefault();
        dispatch("zinput", input);
        input = "";
    }

    function focus(node) {
        node.focus();
    }

    export function receiveTextResponse(text) {
        console.log(">>", text);
    }
</script>

<input
    use:focus
    bind:this={inputEl}
    bind:value={input}
    on:submit={onSubmit}
    on:keydown={(event) => {
        if (event.key === "Enter") {
            last_cmd = input;
            onSubmit(event);
        }

        if (event.key === "ArrowUp") {
            console.log("ArrowUp");
            input = last_cmd;
            // move cursor to end of inputEl
            setTimeout(() => {
                inputEl.selectionStart = inputEl.selectionEnd = input.length;
            }, 50);
        }
    }}
/>

<style>
    input {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        font-size: 1.5em;
    }
</style>
