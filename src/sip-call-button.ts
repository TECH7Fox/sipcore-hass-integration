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
}

@customElement("sip-call-button")
class SIPCallButtonCard extends LitElement {
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
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                --mdc-icon-button-size: 64px;
                --mdc-icon-size: 40px;
            }

            ha-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .call {
                color: var(--label-badge-green);
            }

            .hangup {
                color: var(--label-badge-red);
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

    render() {
        // The call state lives in the global sipCore singleton, so an ongoing
        // call is still reflected here after navigating away and back.
        const isIdle = sipCore.callState === CALLSTATE.IDLE;

        return html`
            <ha-card>
                ${isIdle
                    ? html`
                          <ha-icon-button
                              class="call"
                              label="Call ${this.config?.name || this.config?.extension}"
                              @click="${() => sipCore.startCall(this.config?.extension || "")}"
                          >
                              <ha-icon .icon=${"mdi:phone"}></ha-icon>
                          </ha-icon-button>
                      `
                    : html`
                          <ha-icon-button
                              class="hangup"
                              label="End call"
                              @click="${() => sipCore.endCall()}"
                          >
                              <ha-icon .icon=${"mdi:phone-off"}></ha-icon>
                          </ha-icon-button>
                      `}
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
