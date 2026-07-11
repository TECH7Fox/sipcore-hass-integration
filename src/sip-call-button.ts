import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sipCore, CALLSTATE } from "./sip-core";

declare global {
    interface Window {
        customCards?: Array<{ type: string; name: string; preview: boolean; description: string }>;
    }
}

interface CallButtonCardConfig {
    extension: string;
    name: string;
    rainbow_border: boolean;
    override_icon: string | null;
}

@customElement("sip-call-button")
class SIPCallButtonCard extends LitElement {
    static {
        try {
            (CSS as any).registerProperty({
                name: "--border-angle",
                syntax: "<angle>",
                initialValue: "0deg",
                inherits: false,
            });
            (CSS as any).registerProperty({
                name: "--glow-hue",
                syntax: "<number>",
                initialValue: "0",
                inherits: false,
            });
        } catch (_) {
            // Already registered
        }
    }

    @property()
    public hass = sipCore.hass;

    @property()
    public config: CallButtonCardConfig | undefined;

    setConfig(config: any) {
        if (!config.extension) {
            throw new Error("You need to define an extension to call");
        }
        this.config = config;
    }

    static getStubConfig() {
        return {
            extension: "100",
        };
    }

    getCardSize() {
        return 1;
    }

    static get styles() {
        return css`
            ha-card {
                display: grid;
                grid-template-rows: auto 1fr auto;
                align-items: center;
                justify-items: center;
                padding: 12px 8px 8px;
                min-height: 160px;
                cursor: pointer;
                user-select: none;
                position: relative;
                overflow: hidden;
                transition: transform 0.12s ease, box-shadow 0.12s ease;
            }

            ha-card:active {
                transform: scale(0.96);
                box-shadow: none !important;
            }

            ha-card.fill-container {
                height: 100%;
            }

            .name {
                font-size: 16px;
                font-weight: 500;
                color: var(--secondary-text-color);
                text-align: center;
                width: 100%;
                padding: 0 0 8px;
                letter-spacing: 0.02em;
            }

            .icon-area {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            ha-icon.call {
                color: var(--label-badge-green);
                --mdc-icon-size: 40px;
            }

            ha-icon.hangup {
                color: var(--label-badge-red);
                --mdc-icon-size: 40px;
            }

            .controls-area {
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .mute {
                color: var(--secondary-text-color);
                --mdc-icon-button-size: 40px;
                --mdc-icon-size: 24px;
            }

            /* Blink/pulse the card background while making an outgoing call */
            ha-card.ringing {
                animation: ringing-pulse 2s infinite;
            }

            @keyframes ringing-pulse {
                0% {
                    box-shadow: inset 0 0 0 0 rgb(0, 160, 0);
                }
                50% {
                    box-shadow: inset 0 0 10px 5px rgb(0, 160, 0);
                }
                100% {
                    box-shadow: inset 0 0 0 0 rgb(0, 160, 0);
                }
            }

            /* Flash border and shake icon on an incoming call */
            ha-card.incoming {
                animation: incoming-flash 1s ease-in-out infinite;
            }

            ha-card.incoming .icon-area ha-icon {
                animation: incoming-shake 1s ease-in-out infinite;
            }

            @keyframes incoming-flash {
                0%   { box-shadow: inset 0 0 0 0 rgba(0, 160, 255, 0); border-color: transparent; }
                40%  { box-shadow: inset 0 0 14px 6px rgba(0, 160, 255, 0.45); }
                60%  { box-shadow: inset 0 0 14px 6px rgba(0, 160, 255, 0.45); }
                100% { box-shadow: inset 0 0 0 0 rgba(0, 160, 255, 0); }
            }

            @keyframes incoming-shake {
                0%   { transform: rotate(0deg); }
                15%  { transform: rotate(-18deg); }
                30%  { transform: rotate(18deg); }
                45%  { transform: rotate(-12deg); }
                60%  { transform: rotate(12deg); }
                75%  { transform: rotate(-6deg); }
                90%  { transform: rotate(6deg); }
                100% { transform: rotate(0deg); }
            }

            /* Rainbow border while in a call */
            ha-card.in-call {
                --border-angle: 0deg;
                --glow-hue: 0;
                border: 3px solid transparent;
                background:
                    linear-gradient(
                        var(--ha-card-background, var(--card-background-color, white)),
                        var(--ha-card-background, var(--card-background-color, white))
                    ) padding-box,
                    conic-gradient(
                        from var(--border-angle),
                        hsl(0,   100%, 55%),
                        hsl(60,  100%, 50%),
                        hsl(120, 100%, 42%),
                        hsl(180, 100%, 45%),
                        hsl(240, 100%, 62%),
                        hsl(300, 100%, 55%),
                        hsl(360, 100%, 55%)
                    ) border-box;
                box-shadow: inset 0 0 28px 4px hsla(var(--glow-hue), 90%, 60%, 0.25);
                animation: spin-rainbow-border 5s linear infinite, spin-glow-hue 5s linear infinite;
            }

            @keyframes spin-rainbow-border {
                to { --border-angle: 360deg; }
            }

            @keyframes spin-glow-hue {
                to { --glow-hue: 360; }
            }
        `;
    }

    updateHandler = () => {
        this.requestUpdate();
    };

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("sipcore-update", this.updateHandler);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("sipcore-update", this.updateHandler);
    }

    handleClick() {
        const callState = sipCore.callState;
        if (callState === CALLSTATE.IDLE) {
            sipCore.startCall(this.config?.extension || "");
        } else if (callState === CALLSTATE.INCOMING) {
            sipCore.answerCall();
        } else {
            sipCore.endCall();
        }
    }

    render() {
        // The call state lives in the global sipCore singleton, so an ongoing
        // call is still reflected here after navigating away and back.
        const callState = sipCore.callState;
        const isIdle = callState === CALLSTATE.IDLE;
        const isIncoming = callState === CALLSTATE.INCOMING;
        const isConnected = callState === CALLSTATE.CONNECTED;
        const isOutgoing = callState === CALLSTATE.OUTGOING;
        const isMuted = sipCore.RTCSession?.isMuted().audio ?? false;

        const icon = isIdle
            ? this.config?.override_icon || "mdi:phone"
            : isIncoming
            ? "mdi:phone-incoming"
            : isConnected
            ? "mdi:phone-off"
            : "mdi:phone-settings";
        const iconClass = isIdle || isIncoming ? "call" : "hangup";

        return html`
            <ha-card class="${isIncoming ? "incoming" : ""} ${isOutgoing ? "ringing" : ""} ${isConnected && this.config?.rainbow_border ? "in-call" : ""} fill-container" @click="${this.handleClick}">
                <ha-ripple></ha-ripple>
                <div class="name">${this.config?.name || ""}</div>
                <div class="icon-area">
                    <ha-icon class="${iconClass}" .icon=${icon}></ha-icon>
                </div>
                <div class="controls-area">
                    ${isConnected
                        ? html`
                              <ha-icon-button
                                  class="mute"
                                  label="${isMuted ? "Unmute" : "Mute"}"
                                  ?disabled="${sipCore.RTCSession === null}"
                                  @click="${(e: Event) => {
                                      e.stopPropagation();
                                      if (isMuted) sipCore.RTCSession?.unmute({ audio: true });
                                      else sipCore.RTCSession?.mute({ audio: true });
                                      this.requestUpdate();
                                  }}"
                              >
                                  <ha-icon .icon=${isMuted ? "mdi:microphone-off" : "mdi:microphone"}></ha-icon>
                              </ha-icon-button>
                          `
                        : html``}
                </div>
            </ha-card>
        `;
    }
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "sip-call-button",
    name: "SIP Call Button Card",
    preview: true,
    description: "A simple call/hangup button for a single extension",
});
