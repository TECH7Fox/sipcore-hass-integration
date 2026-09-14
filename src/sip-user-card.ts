import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { sipCore } from "./sip-core";

declare global {
    interface Window {
        customCards?: Array<{ type: string; name: string; preview: boolean; description: string }>;
    }
}

interface SIPUserCardConfig {
    extension: string;
    password: string;
    display_name?: string;
}

/**
 * A zero-height Lovelace card that forces SIP Core to register with a specific
 * Asterisk extension on this device, regardless of which HA user is logged in.
 *
 * Add to a dashboard's YAML to configure a tablet or kiosk:
 *
 * @example
 * type: custom:sip-user-card
 * extension: "100"
 * password: "mypassword"
 * display_name: "Front Door Panel"   # optional
 *
 * Removing the card from the dashboard clears the override and reverts to
 * normal Home Assistant user matching.
 */
@customElement("sip-user-card")
class SIPUserCard extends LitElement {
    @state()
    private config: SIPUserCardConfig | undefined;

    static get styles() {
        return css`
            :host {
                display: block;
                /* Zero height — this card is purely a config carrier */
                height: 0;
                overflow: hidden;
            }

            .status {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                font-size: 12px;
                color: var(--secondary-text-color);
                font-family: var(--paper-font-body1_-_font-family);
            }

            .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .dot.registered {
                background-color: var(--label-badge-green, #4caf50);
            }

            .dot.unregistered {
                background-color: var(--label-badge-red, #f44336);
            }
        `;
    }

// Called by HA with the YAML config whenever the dashboard loads or config changes.
    setConfig(config: SIPUserCardConfig) {
        if (!config.extension) throw new Error("sip-user-card: 'extension' is required");
        if (!config.password) throw new Error("sip-user-card: 'password' is required");

        // GUARD: Only trigger a re-registration if the credentials actually changed.
        // This prevents HA's aggressive Lovelace rendering from spamming the Asterisk server.
        const currentForceUser = sipCore.ForceUser;
        const configChanged = 
            !currentForceUser || 
            currentForceUser.extension !== config.extension || 
            currentForceUser.password !== config.password;

        if (configChanged) {
            console.info(`sip-user-card: New credentials detected for ${config.extension}. Updating localStorage...`);
            
            // Write to localStorage
            sipCore.ForceUser = {
                extension: config.extension,
                password: config.password,
                display_name: config.display_name,
            };
            
            // Tell SIP Core to drop the old connection and log in with the new one
            sipCore.applyForceUser();
        }

        this.config = config;
    }

    static getStubConfig(): SIPUserCardConfig {
        return {
            extension: "100",
            password: "mypassword",
            display_name: "Front Door Panel",
        };
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("sipcore-update", this.updateHandler);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("sipcore-update", this.updateHandler);
        // Credentials remain in localStorage — this device stays registered as
        // the forced extension until manually cleared via:
        // localStorage.removeItem('sipcore-force-user')
    }

    private updateHandler = () => {
        this.requestUpdate();
    };

    render() {
        const registered = sipCore.registered;
        const ext = this.config?.extension ?? "?";
        const name = this.config?.display_name ?? ext;

        return html`
            <div class="status">
                <span class="dot ${registered ? "registered" : "unregistered"}"></span>
                <span>${name} (${ext}) — ${registered ? "Registered" : "Unregistered"}</span>
            </div>
        `;
    }

    // Card height hint for HA layout engine — report 0 so it takes no grid space.
    getCardSize() {
        return 0;
    }
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "sip-user-card",
    name: "SIP User Card",
    preview: false,
    description: "Forces SIP Core to register as a specific Asterisk extension on this device, regardless of the logged-in HA user. Useful for shared tablets and kiosk dashboards.",
});
