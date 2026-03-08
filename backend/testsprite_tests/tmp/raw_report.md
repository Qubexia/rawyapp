
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** backend
- **Date:** 2026-03-08
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 get_health_check_status
- **Test Code:** [TC001_get_health_check_status.py](./TC001_get_health_check_status.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 173, in <module>
  File "<string>", line 85, in test_get_health_check_with_full_engagement_flow
AssertionError

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/09a0e8cb-e488-472c-add2-454fe07d4dba
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 post_auth_register_with_valid_data
- **Test Code:** [TC002_post_auth_register_with_valid_data.py](./TC002_post_auth_register_with_valid_data.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 217, in <module>
  File "<string>", line 36, in post_auth_register_with_valid_data
AssertionError: Expected 201 on register, got 400: {"statusCode":400,"message":"Name must not exceed 50 characters, Name must be at least 2 characters long, Name must be a string, Name is required","error":"Bad Request","timestamp":"2026-03-08T03:53:31.417Z","path":"/api/v1/auth/register"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/d0de7698-b8d6-44d3-9c75-7188d86bc61a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 post_auth_login_with_valid_credentials
- **Test Code:** [TC003_post_auth_login_with_valid_credentials.py](./TC003_post_auth_login_with_valid_credentials.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 202, in <module>
  File "<string>", line 112, in test_post_auth_login_with_valid_credentials
  File "<string>", line 14, in register_user
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 400 Client Error: Bad Request for url: http://localhost:3000/api/v1/auth/register

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/e6c6e585-d1a1-4537-8fd6-61ef8a30b105
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 post_auth_refresh_with_valid_token
- **Test Code:** [TC004_post_auth_refresh_with_valid_token.py](./TC004_post_auth_refresh_with_valid_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 234, in <module>
  File "<string>", line 22, in post_auth_refresh_with_valid_token
AssertionError: Register failed: {"statusCode":400,"message":"Name must not exceed 50 characters, Name must be at least 2 characters long, Name must be a string, Name is required","error":"Bad Request","timestamp":"2026-03-08T03:53:21.838Z","path":"/api/v1/auth/register"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/93461e19-9fc7-4d9b-bbd6-2460cdeb03ce
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 post_auth_logout_with_valid_access_token
- **Test Code:** [TC005_post_auth_logout_with_valid_access_token.py](./TC005_post_auth_logout_with_valid_access_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 215, in <module>
  File "<string>", line 145, in post_auth_logout_with_valid_access_token
AssertionError: No creator id returned

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/006c47da-3c61-477d-a6ad-0c2b06b4cacf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 get_auth_google_redirect
- **Test Code:** [TC006_get_auth_google_redirect.py](./TC006_get_auth_google_redirect.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 196, in <module>
  File "<string>", line 19, in test_get_auth_google_redirect_and_smoke_flow
AssertionError: Login failed: {"statusCode":201,"data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWE3ODQ2ODc4YmU2MTdjMGFlYzJkNDQiLCJlbWFpbCI6ImFkbWluQHJhd3kuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyOTQxOTk5LCJleHAiOjE3NzI5NDI4OTl9.MUJYOUsMsbyuRdUlOOdpz1jFEefP-C9olWp_dTq8xbo","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWE3ODQ2ODc4YmU2MTdjMGFlYzJkNDQiLCJlbWFpbCI6ImFkbWluQHJhd3kuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyOTQxOTk5LCJleHAiOjE3NzM1NDY3OTl9.GrFx7f6h4NhpMRUr3hwLsonhysNHF3NPb3wOWEaWp3M","user":{"pushEnabled":true,"followerCount":0,"followingCount":0,"_id":"69a7846878be617c0aec2d44","name":"Admin","email":"admin@rawy.com","passwordHash":"$2b$10$QHaX5x95/zdmzGDC4GF3EOHghzgI4h5HmvKruIHkHfSL8tT97EH0y","role":"ADMIN","isActive":true,"deviceTokens":[],"createdAt":"2026-03-04T01:01:28.670Z","updatedAt":"2026-03-08T03:53:04.611Z","__v":0}}}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/16e9c07f-f815-4607-b06c-b3d42a249bc1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 get_auth_google_callback_with_provider_code
- **Test Code:** [TC007_get_auth_google_callback_with_provider_code.py](./TC007_get_auth_google_callback_with_provider_code.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 191, in <module>
  File "<string>", line 16, in test_get_auth_google_callback_with_provider_code
AssertionError: Admin login failed

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/74c8c239-a9c7-4b61-98fc-ee8064e51cfb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 get_auth_facebook_redirect
- **Test Code:** [TC008_get_auth_facebook_redirect.py](./TC008_get_auth_facebook_redirect.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 225, in <module>
  File "<string>", line 44, in test_get_auth_facebook_redirect_and_engagements
AssertionError: User registration failed: {"statusCode":400,"message":"Name must not exceed 50 characters, Name must be at least 2 characters long, Name must be a string, Name is required","error":"Bad Request","timestamp":"2026-03-08T03:54:15.682Z","path":"/api/v1/auth/register"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/412568b6-0a84-4a64-a39b-26f91fd4e047
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 get_auth_facebook_callback_with_provider_code
- **Test Code:** [TC009_get_auth_facebook_callback_with_provider_code.py](./TC009_get_auth_facebook_callback_with_provider_code.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 242, in <module>
  File "<string>", line 24, in test_get_auth_facebook_callback_with_provider_code
AssertionError: Register failed: {"statusCode":400,"message":"Name must not exceed 50 characters, Name must be at least 2 characters long, Name must be a string, Name is required","error":"Bad Request","timestamp":"2026-03-08T03:54:22.318Z","path":"/api/v1/auth/register"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fd6f95ac-467d-4671-99bc-044a9250094f/7d770390-4410-4861-8ec5-1ba375a727aa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---