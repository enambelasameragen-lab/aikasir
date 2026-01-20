#!/usr/bin/env python3
"""
AIKasir Backend API Testing
Tests all Phase 1 functionality including AI Onboarding, Auth, Items, Transactions, Dashboard
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class AIKasirTester:
    def __init__(self, base_url="https://simplekasir.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tenant_id = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_email = "kopibangjago@test.com"
        self.test_password = "98ecf367"
        
    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            "name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}
                
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}
                
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic API health"""
        print("\n🔍 Testing API Health...")
        success, data = self.make_request('GET', '/', expected_status=200)
        return self.log_test(
            "API Health Check", 
            success, 
            f"Response: {data.get('message', 'No message')}" if success else f"Error: {data}",
            data
        )

    def test_ai_onboarding(self):
        """Test AI Onboarding flow"""
        print("\n🤖 Testing AI Onboarding...")
        
        # Test AI conversation
        messages = [
            "Warung kopi",
            "Kopi Bang Jago", 
            "Kopi susu, kopi hitam, gorengan, nasi uduk",
            "testowner@aikasir.com"
        ]
        
        session_id = None
        for i, message in enumerate(messages):
            payload = {"message": message}
            if session_id:
                payload["session_id"] = session_id
                
            success, data = self.make_request('POST', '/v1/ai/onboard', payload)
            
            if not success:
                return self.log_test(
                    f"AI Onboarding Step {i+1}", 
                    False, 
                    f"Failed: {data}",
                    data
                )
            
            session_id = data.get('session_id')
            
            if data.get('status') == 'complete':
                # Store credentials for later tests
                if data.get('token'):
                    self.token = data['token']
                if data.get('tenant', {}).get('id'):
                    self.tenant_id = data['tenant']['id']
                if data.get('user', {}).get('id'):
                    self.user_id = data['user']['id']
                    
                return self.log_test(
                    "AI Onboarding Complete", 
                    True, 
                    f"Created tenant: {data.get('tenant', {}).get('name', 'Unknown')}",
                    data
                )
        
        return self.log_test("AI Onboarding", False, "Did not complete after all messages")

    def test_login(self):
        """Test login with existing credentials"""
        print("\n🔐 Testing Login...")
        
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, data = self.make_request('POST', '/v1/auth/login', payload)
        
        if success and data.get('token'):
            self.token = data['token']
            self.tenant_id = data.get('tenant', {}).get('id')
            self.user_id = data.get('user', {}).get('id')
            
        return self.log_test(
            "Login with Test Credentials", 
            success and 'token' in data, 
            f"User: {data.get('user', {}).get('name', 'Unknown')}" if success else f"Error: {data}",
            data
        )

    def test_get_me(self):
        """Test get current user info"""
        if not self.token:
            return self.log_test("Get User Info", False, "No token available")
            
        success, data = self.make_request('GET', '/v1/auth/me')
        return self.log_test(
            "Get Current User Info", 
            success and 'user' in data, 
            f"User: {data.get('user', {}).get('name', 'Unknown')}" if success else f"Error: {data}",
            data
        )

    def test_items_crud(self):
        """Test Items CRUD operations"""
        print("\n📦 Testing Items Management...")
        
        if not self.token:
            return self.log_test("Items CRUD", False, "No token available")
        
        # Test GET items
        success, data = self.make_request('GET', '/v1/items')
        if not self.log_test(
            "Get Items List", 
            success and 'items' in data, 
            f"Found {len(data.get('items', []))} items" if success else f"Error: {data}",
            data
        ):
            return False
            
        # Test CREATE item
        test_item = {
            "name": f"Test Item {datetime.now().strftime('%H%M%S')}",
            "price": 15000
        }
        
        success, data = self.make_request('POST', '/v1/items', test_item, expected_status=201)
        if not success:
            return self.log_test("Create Item", False, f"Error: {data}", data)
            
        created_item_id = data.get('id')
        self.log_test(
            "Create Item", 
            success and created_item_id, 
            f"Created: {data.get('name', 'Unknown')} - Rp {data.get('price', 0):,}",
            data
        )
        
        if not created_item_id:
            return False
            
        # Test UPDATE item
        update_data = {
            "name": f"Updated Test Item {datetime.now().strftime('%H%M%S')}",
            "price": 20000
        }
        
        success, data = self.make_request('PUT', f'/v1/items/{created_item_id}', update_data)
        self.log_test(
            "Update Item", 
            success and data.get('name') == update_data['name'], 
            f"Updated: {data.get('name', 'Unknown')} - Rp {data.get('price', 0):,}" if success else f"Error: {data}",
            data
        )
        
        # Test DELETE item
        success, data = self.make_request('DELETE', f'/v1/items/{created_item_id}')
        return self.log_test(
            "Delete Item", 
            success, 
            "Item deleted successfully" if success else f"Error: {data}",
            data
        )

    def test_transactions(self):
        """Test Transaction operations"""
        print("\n💰 Testing Transactions...")
        
        if not self.token:
            return self.log_test("Transactions", False, "No token available")
            
        # First get available items
        success, items_data = self.make_request('GET', '/v1/items')
        if not success or not items_data.get('items'):
            return self.log_test("Get Items for Transaction", False, "No items available for transaction")
            
        items = items_data['items']
        if len(items) == 0:
            return self.log_test("Transaction Test", False, "No items available to create transaction")
            
        # Create a test transaction
        test_transaction = {
            "items": [
                {
                    "item_id": items[0]['id'],
                    "qty": 2
                }
            ],
            "payment_method": "tunai",
            "payment_amount": items[0]['price'] * 2 + 5000  # Add extra for change
        }
        
        success, data = self.make_request('POST', '/v1/transactions', test_transaction, expected_status=201)
        if not success:
            return self.log_test("Create Transaction", False, f"Error: {data}", data)
            
        transaction_id = data.get('id')
        total = data.get('total', 0)
        change = data.get('change_amount', 0)
        
        self.log_test(
            "Create Transaction", 
            success and transaction_id, 
            f"Total: Rp {total:,}, Change: Rp {change:,}",
            data
        )
        
        if not transaction_id:
            return False
            
        # Test GET transactions
        success, data = self.make_request('GET', '/v1/transactions')
        self.log_test(
            "Get Transactions List", 
            success and 'transactions' in data, 
            f"Found {len(data.get('transactions', []))} transactions" if success else f"Error: {data}",
            data
        )
        
        # Test GET single transaction
        success, data = self.make_request('GET', f'/v1/transactions/{transaction_id}')
        return self.log_test(
            "Get Transaction Detail", 
            success and 'transaction' in data, 
            f"Transaction #{data.get('transaction', {}).get('transaction_number', 'Unknown')}" if success else f"Error: {data}",
            data
        )

    def test_dashboard(self):
        """Test Dashboard data"""
        print("\n📊 Testing Dashboard...")
        
        if not self.token:
            return self.log_test("Dashboard", False, "No token available")
            
        success, data = self.make_request('GET', '/v1/dashboard/today')
        
        if success:
            total_sales = data.get('total_sales', 0)
            total_transactions = data.get('total_transactions', 0)
            total_items_sold = data.get('total_items_sold', 0)
            
            details = f"Sales: Rp {total_sales:,}, Transactions: {total_transactions}, Items: {total_items_sold}"
        else:
            details = f"Error: {data}"
            
        return self.log_test(
            "Get Dashboard Today", 
            success and 'total_sales' in data, 
            details,
            data
        )

    def test_user_management_owner(self):
        """Test User Management APIs (Owner access)"""
        print("\n👥 Testing User Management (Owner)...")
        
        if not self.token:
            return self.log_test("User Management", False, "No token available")
        
        # Test GET users (owner only)
        success, data = self.make_request('GET', '/v1/users')
        if not self.log_test(
            "Get Users List (Owner)", 
            success and 'users' in data, 
            f"Found {len(data.get('users', []))} users" if success else f"Error: {data}",
            data
        ):
            return False
        
        # Test invite user
        invite_data = {
            "name": "Test Kasir",
            "email": f"testkasir{datetime.now().strftime('%H%M%S')}@test.com",
            "role": "kasir"
        }
        
        success, data = self.make_request('POST', '/v1/users/invite', invite_data, expected_status=201)
        if not success:
            return self.log_test("Invite User", False, f"Error: {data}", data)
        
        invite_token = data.get('invite_token')
        self.log_test(
            "Invite User", 
            success and invite_token, 
            f"Invited: {invite_data['name']} ({invite_data['email']})",
            data
        )
        
        if not invite_token:
            return False
        
        # Test get invite info
        success, data = self.make_request('GET', f'/v1/users/invite/{invite_token}')
        self.log_test(
            "Get Invite Info", 
            success and 'name' in data, 
            f"Invite for: {data.get('name', 'Unknown')} at {data.get('tenant_name', 'Unknown')}" if success else f"Error: {data}",
            data
        )
        
        # Test accept invite
        accept_data = {
            "token": invite_token,
            "password": "testpass123"
        }
        
        success, data = self.make_request('POST', '/v1/users/accept-invite', accept_data)
        return self.log_test(
            "Accept Invite", 
            success and 'token' in data, 
            f"Account activated for: {data.get('user', {}).get('name', 'Unknown')}" if success else f"Error: {data}",
            data
        )

    def test_user_management_kasir(self):
        """Test User Management APIs with Kasir credentials (should fail)"""
        print("\n🚫 Testing User Management (Kasir - Should Fail)...")
        
        # Login as kasir
        kasir_payload = {
            "email": "dedi@test.com",
            "password": "kasir123"
        }
        
        success, data = self.make_request('POST', '/v1/auth/login', kasir_payload)
        if not success:
            return self.log_test("Kasir Login", False, f"Cannot test kasir restrictions - login failed: {data}")
        
        # Store original token
        original_token = self.token
        kasir_token = data.get('token')
        self.token = kasir_token
        
        # Test GET users (should fail with 403)
        success, data = self.make_request('GET', '/v1/users', expected_status=403)
        kasir_blocked = success and data.get('detail') and 'pemilik' in data.get('detail', '')
        
        self.log_test(
            "Kasir Access to Users API (Should Fail)", 
            kasir_blocked, 
            f"Correctly blocked: {data.get('detail', 'Access denied')}" if kasir_blocked else f"ERROR: Kasir got access: {data}",
            data
        )
        
        # Restore original token
        self.token = original_token
        return kasir_blocked

    def test_subdomain_check(self):
        """Test Subdomain Check API"""
        print("\n🌐 Testing Subdomain Check...")
        
        # Test existing subdomain
        success, data = self.make_request('GET', '/v1/tenant/check/kopibangjago')
        existing_check = self.log_test(
            "Check Existing Subdomain", 
            success and data.get('exists') == True, 
            f"Found tenant: {data.get('tenant', {}).get('name', 'Unknown')}" if success else f"Error: {data}",
            data
        )
        
        # Test non-existing subdomain
        success, data = self.make_request('GET', '/v1/tenant/check/nonexistentsubdomain', expected_status=404)
        nonexistent_check = success and data.get('detail')
        
        self.log_test(
            "Check Non-existing Subdomain", 
            nonexistent_check, 
            f"Correctly returned 404: {data.get('detail', 'Not found')}" if nonexistent_check else f"ERROR: Found non-existent subdomain: {data}",
            data
        )
        
        return existing_check and nonexistent_check

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting AIKasir Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_login,  # Try existing credentials first
            self.test_get_me,
            self.test_items_crud,
            self.test_transactions,
            self.test_dashboard,
            self.test_user_management_owner,
            self.test_user_management_kasir,
            self.test_subdomain_check,
        ]
        
        # Run all tests in sequence
        for test_func in tests:
            test_func()
        
        # If login failed and we don't have token, try AI onboarding
        if not self.token:
            print("\n⚠️  Login failed, trying AI Onboarding...")
            self.test_ai_onboarding()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run} ({success_rate:.1f}%)")
        
        if self.tests_passed < self.tests_run:
            print(f"❌ Failed: {self.tests_run - self.tests_passed}")
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['name']}: {result['details']}")
        
        print("\n🎯 Backend API Status:", "HEALTHY" if success_rate >= 80 else "NEEDS ATTENTION")
        
        return success_rate >= 80

def main():
    tester = AIKasirTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())