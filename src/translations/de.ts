// German translation dictionary for the SIP Core frontend cards.
//
// Typed against `TranslationKey` so a missing or misspelled key here fails
// the TypeScript build instead of silently falling back to English at
// runtime.

import type { TranslationKey } from "./en";

const de: Record<TranslationKey, string> = {
    no_active_call: "Kein aktiver Anruf",
    incoming_call_from: "Eingehender Anruf von {name}",
    outgoing_call_to: "Ausgehender Anruf an {name}",
    connected_to: "Verbunden mit {name}",
    connecting_to: "Verbinde mit {name}",
    unknown_call_state: "Unbekannter Anrufstatus",
    answer_call: "Anruf annehmen",
    end_call: "Anruf beenden",
    mute_audio: "Audio stummschalten",
    unmute_audio: "Audio-Stummschaltung aufheben",
    mute_video: "Video stummschalten",
    unmute_video: "Video-Stummschaltung aufheben",
    mute: "Stummschalten",
    unmute: "Stummschaltung aufheben",
    close: "Schließen",
    back: "Zurück",
    settings: "Einstellungen",
    more: "Mehr",
    documentation: "Dokumentation",
    call: "Anruf",
    sip_call_settings: "SIP-Anrufeinstellungen",
    audio_output: "Audioausgabe",
    audio_input: "Audioeingabe",
    default_output: "Standardausgabe",
    default_input: "Standardeingabe",
    audio_output_fallback: "Audioausgabe",
    audio_input_fallback: "Audioeingabe",
    logged_in_as: "Angemeldet als {username}",
    logged_in_as_description:
        "Der aktuelle Benutzer, der bei dem SIP-Server angemeldet ist. Benutzer können in den SIP Core-Optionen konfiguriert werden",
    registered: "registriert",
    not_registered: "nicht registriert",
    is_status: "Ist {status}",
    registration_status_description:
        "Der aktuelle Registrierungsstatus des SIP-Clients. Falls nicht registriert, prüfen Sie die Browser-Konsole und die Asterisk-Protokolle für weitere Informationen",
    call_state_is: "Anrufstatus ist {state}",
    call_state_description: "Der aktuelle Anrufstatus des SIP-Clients",
    sip_core_description: "Das SIP-Anrufsystem, erstellt von Jordy Kuhne",
    open_call_popup: "Anruf-Popup öffnen",
    contacts: "Kontakte",
    call_button: "ANRUFEN",
};

export default de;
