

import logging
from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
    ResourceYAMLCollection,
)
from homeassistant.const import CONF_ID, CONF_URL
from homeassistant.components.lovelace.const import (
    CONF_RESOURCE_TYPE_WS,
    DOMAIN as LL_DOMAIN,
)
from homeassistant.loader import IntegrationNotLoaded, async_get_loaded_integration
from .const import DOMAIN, JS_URL_PATH
from homeassistant.core import HomeAssistant


logger = logging.getLogger(__name__)


def module_url(hass: HomeAssistant) -> str:
    """Return the module URL, carrying the integration version as a cache buster.

    The bundle is served from a static path registered with `cache_headers=True`,
    so Home Assistant answers `Cache-Control: public, max-age=2678400` (31 days).
    The path itself is identical in every release, so without a version in the
    query string nothing ever invalidates that entry: after an update Home
    Assistant serves the new bundle while browsers keep running the old one.
    """
    try:
        version = async_get_loaded_integration(hass, DOMAIN).version
    except IntegrationNotLoaded:
        version = None
    return f"{JS_URL_PATH}?v={version}" if version else JS_URL_PATH


def _matches(data: dict) -> bool:
    """Whether a Lovelace resource points at our module, whatever its version."""
    return str(data.get(CONF_URL, "")).split("?")[0] == JS_URL_PATH


async def add_resources(hass: HomeAssistant):
    """Add SIP Core resources to Lovelace."""

    url = module_url(hass)

    resources: ResourceStorageCollection | ResourceYAMLCollection | None = None
    if lovelace_data := hass.data.get(LL_DOMAIN):
        resources = lovelace_data.resources
    if resources:
        if not resources.loaded:
            await resources.async_load()
            logger.debug("Manually loaded resources")
            resources.loaded = True

        if isinstance(resources, ResourceYAMLCollection):
            # The resource list is read-only here, so register the module with the
            # frontend directly instead of giving up. Skip it when the user already
            # declared the module in YAML: registering it again would load and
            # initialise SIP Core twice on every page.
            if any(_matches(data) for data in resources.async_items() or []):
                logger.warning(
                    "SIP Core is declared in the YAML Lovelace resources. Append "
                    "'?v=<version>' to that entry and change it on every update, or "
                    "browsers will keep serving the previously installed bundle"
                )
                return
            logger.info("Lovelace resources are managed via YAML, registering SIP Core as an extra module: %s", url)
            add_extra_js_url(hass, url)
            return

        existing = next(
            (data for data in resources.async_items() if _matches(data)),
            None,
        )

        if existing is None:
            logger.info("Registering SIP Core module in Lovelace resources")
            data = await resources.async_create_item(
                {CONF_RESOURCE_TYPE_WS: "module", CONF_URL: url}
            )
            logger.debug(f"Registered SIP Core module {url} with resource ID {data[CONF_ID]}")
        elif existing[CONF_URL] != url:
            logger.info(f"Updating SIP Core module URL to {url}")
            await resources.async_update_item(
                existing[CONF_ID], {CONF_RESOURCE_TYPE_WS: "module", CONF_URL: url}
            )
        else:
            logger.debug(f"module already registered with resource ID {existing[CONF_ID]}")


async def remove_resources(hass: HomeAssistant):
    """Remove SIP Core resources from Lovelace."""

    resources: ResourceStorageCollection | ResourceYAMLCollection | None = None
    if lovelace_data := hass.data.get(LL_DOMAIN):
        resources = lovelace_data.resources
    if resources:
        if not resources.loaded:
            await resources.async_load()
            logger.debug("Manually loaded resources for unload")
            resources.loaded = True

        if isinstance(resources, ResourceYAMLCollection):
            try:
                remove_extra_js_url(hass, module_url(hass))
            except KeyError:
                # Never registered, or registered under a different version.
                logger.debug("SIP Core extra module not registered during unload")
            return

        res_id = next(
            (data[CONF_ID] for data in resources.async_items() if _matches(data)),
            None,
        )

        if res_id is not None and isinstance(resources, ResourceStorageCollection):
            logger.info("Removing SIP Core module from Lovelace resources")
            await resources.async_delete_item(res_id)
        else:
            logger.debug("SIP Core module resource not found during unload")
