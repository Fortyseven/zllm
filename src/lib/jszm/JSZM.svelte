<script lang="ts">
    // @ts-nocheck

    import gameData from "./zork.z3";
    import JSZM from "./jszm";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { buffered_output } from "../../stores";

    let game;
    let jszm;
    let output = writable("");
    let result;
    let local_buffer = "";
    let outputEl;

    export let handler;

    let input = "";

    onMount(async function () {
        const response = await fetch(gameData);

        const data = await response.arrayBuffer();

        jszm = new JSZM(data);
        jszm.print = story_print;
        jszm.read = story_read;

        game = jszm.run();

        // jszm.highlight = story_highlight;
        // jszm.restarted = cls;
        // jszm.updateStatusLine = jszm.statusType
        //     ? story_status_time
        //     : story_status_score;
    });

    function* story_print(text) {
        if (text === "") {
            $buffered_output = ""; // ugly hack
            $buffered_output = local_buffer.replaceAll(">", "");

            $output += local_buffer;
            local_buffer = "";
            setTimeout(() => {
                outputEl.scrollTop = outputEl.scrollHeight;
            }, 50);
        } else {
            local_buffer += text;
        }
    }

    function* story_read(max_chars) {
        if (!input) {
            yield "";
        }

        let cmd = input;
        input = "";
        return cmd;
    }

    function onZInput(cmd) {
        console.log("onZinput", cmd.detail);
        $output += ` ${cmd.detail}\n`;
        input = cmd.detail;
        game.next();
        input = "";
    }

    // bootstrap
    $: if (game) {
        result = game.next();
    }
</script>

<pre bind:this={outputEl}>{$output}</pre>
<svelte:component
    this={handler}
    on:zinput={onZInput}
/>

<style>
    pre {
        background-color: rgb(0, 0, 0);
        color: #fb0;
        font-family: monospace;
        font-size: 13pt;
        height: 400px;
        overflow-y: scroll;
        line-height: 1.1em;
        padding: 0.75em;
        text-align: left;
        white-space: pre-wrap;
        margin: auto;
        box-shadow: 0 0 30px #0004;
        margin-bottom: 1em;
        scroll-behavior: smooth;
    }

    pre::after {
        content: " █";
        height: 1em;
        animation: blink 500ms ease-in-out infinite;
    }
    @keyframes blink {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
</style>
