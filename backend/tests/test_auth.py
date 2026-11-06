import pytest
from app.services.auth_service import AuthService
from app.schemas.auth_schema import RegisterRequest, LoginRequest

@pytest.mark.asyncio
async def test_register_and_login():
    reg_req = RegisterRequest(
        full_name="Ramesh Singh",
        email="ramesh.farmer@example.com",
        password="secretpassword123",
        phone="+919876543210",
        farm_name="Singh Organic Farm"
    )
    reg_res = await AuthService.register(reg_req)
    assert "access_token" in reg_res
    assert reg_res["user"]["email"] == "ramesh.farmer@example.com"
    
    login_req = LoginRequest(
        email="ramesh.farmer@example.com",
        password="secretpassword123"
    )
    login_res = await AuthService.login(login_req)
    assert "access_token" in login_res
