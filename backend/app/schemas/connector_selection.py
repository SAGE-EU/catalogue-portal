"""Schemas for connector selection flow."""

from typing import Optional

from pydantic import BaseModel


class ConnectorSelectionRequest(BaseModel):
    """Request data for selecting a connector."""

    party_id: str
    next_url: Optional[str] = None


class ConnectorSelectionResponse(BaseModel):
    """Response data containing the selected connector and redirect URL."""

    redirect_url: str
    selected_connector_party_id: str
    selected_connector_name: Optional[str] = None


class ConnectorSelectionStatusResponse(BaseModel):
    """Response data containing the current connector selection status."""

    selected_connector_party_id: Optional[str] = None
    selected_connector_name: Optional[str] = None
    selected_connector_dashboard_url: Optional[str] = None
