// English translation dictionary for the SIP Core frontend cards.
//
// This is the reference language: `TranslationKey` (derived from this file's
// keys) is used to type-check every other language dictionary so they can't
// drift out of sync with the strings actually used by the cards.

const en = {
    no_active_call: "No active call",
    incoming_call_from: "Incoming call from {name}",
    outgoing_call_to: "Outgoing call to {name}",
    connected_to: "Connected to {name}",
    connecting_to: "Connecting to {name}",
    unknown_call_state: "Unknown call state",
    answer_call: "Answer call",
    end_call: "End call",
    mute_audio: "Mute audio",
    unmute_audio: "Unmute audio",
    mute_video: "Mute video",
    unmute_video: "Unmute video",
    mute: "Mute",
    unmute: "Unmute",
    close: "Close",
    back: "Back",
    settings: "Settings",
    more: "More",
    documentation: "Documentation",
    call: "Call",
    sip_call_settings: "SIP Call Settings",
    audio_output: "Audio Output",
    audio_input: "Audio Input",
    default_output: "Default Output",
    default_input: "Default Input",
    audio_output_fallback: "Audio output",
    audio_input_fallback: "Audio input",
    logged_in_as: "Logged in as {username}",
    logged_in_as_description:
        "The current user used to log in to the SIP server. You can configure users in the SIP Core options",
    registered: "registered",
    not_registered: "not registered",
    is_status: "Is {status}",
    registration_status_description:
        "The current registration status of the SIP client. If not registered, check browser console and Asterisk logs for more information",
    call_state_is: "Call state is {state}",
    call_state_description: "The current call state of the SIP client",
    sip_core_description: "The main SIP call system, created by Jordy Kuhne",
    open_call_popup: "Open Call Popup",
    contacts: "Contacts",
    call_button: "CALL",
};

export type TranslationKey = keyof typeof en;

export default en;
