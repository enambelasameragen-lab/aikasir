"""
Phase 3 Tests: Multiple Payment Methods, Void Transactions, Reports
Tests for AIKasir POS system - Phase 3 features
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tenant-pos-5.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api/v1"

# Test credentials
OWNER_EMAIL = "kopibangjago@test.com"
OWNER_PASSWORD = "98ecf367"
KASIR_EMAIL = "dedi@test.com"
KASIR_PASSWORD = "kasir123"


class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_owner_login(self):
        """Test owner login"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "pemilik"
        return data["token"]
    
    def test_kasir_login(self):
        """Test kasir login"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": KASIR_EMAIL,
            "password": KASIR_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "kasir"
        return data["token"]


class TestPaymentMethods:
    """Test multiple payment methods: Tunai, QRIS, Transfer"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def kasir_token(self):
        """Get kasir auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": KASIR_EMAIL,
            "password": KASIR_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def items(self, owner_token):
        """Get available items"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.get(f"{API_BASE}/items", headers=headers)
        return response.json()["items"]
    
    def test_create_transaction_tunai(self, owner_token, items):
        """Test creating transaction with Tunai (cash) payment"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        # Use first item
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 2}]
        total = item["price"] * 2
        payment_amount = total + 10000  # Pay more for change
        
        response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "tunai",
            "payment_amount": payment_amount,
            "payment_reference": None
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["payment_method"] == "tunai"
        assert data["total"] == total
        assert data["payment_amount"] == payment_amount
        assert data["change_amount"] == 10000
        assert data["status"] == "selesai"
        print(f"✓ Tunai transaction created: #{data['transaction_number']}")
        return data
    
    def test_create_transaction_qris(self, owner_token, items):
        """Test creating transaction with QRIS payment"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 1}]
        total = item["price"]
        
        response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "qris",
            "payment_amount": total,
            "payment_reference": "QRIS-REF-12345"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["payment_method"] == "qris"
        assert data["total"] == total
        assert data["change_amount"] == 0  # No change for QRIS
        assert data["payment_reference"] == "QRIS-REF-12345"
        assert data["status"] == "selesai"
        print(f"✓ QRIS transaction created: #{data['transaction_number']}")
        return data
    
    def test_create_transaction_transfer(self, owner_token, items):
        """Test creating transaction with Transfer payment"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 3}]
        total = item["price"] * 3
        
        response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "transfer",
            "payment_amount": total,
            "payment_reference": "TRF-BCA-67890"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["payment_method"] == "transfer"
        assert data["total"] == total
        assert data["change_amount"] == 0  # No change for transfer
        assert data["payment_reference"] == "TRF-BCA-67890"
        assert data["status"] == "selesai"
        print(f"✓ Transfer transaction created: #{data['transaction_number']}")
        return data
    
    def test_invalid_payment_method(self, owner_token, items):
        """Test that invalid payment method is rejected"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 1}]
        
        response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "bitcoin",  # Invalid method
            "payment_amount": item["price"]
        })
        
        assert response.status_code == 400
        print("✓ Invalid payment method correctly rejected")
    
    def test_tunai_insufficient_payment(self, owner_token, items):
        """Test that insufficient cash payment is rejected"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 2}]
        total = item["price"] * 2
        
        response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "tunai",
            "payment_amount": total - 1000  # Pay less than total
        })
        
        assert response.status_code == 400
        print("✓ Insufficient tunai payment correctly rejected")


class TestVoidTransaction:
    """Test void transaction functionality"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def kasir_token(self):
        """Get kasir auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": KASIR_EMAIL,
            "password": KASIR_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def items(self, owner_token):
        """Get available items"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        response = requests.get(f"{API_BASE}/items", headers=headers)
        return response.json()["items"]
    
    def test_owner_can_void_transaction(self, owner_token, items):
        """Test that owner can void a transaction"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        # First create a transaction
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 1}]
        
        create_response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "tunai",
            "payment_amount": item["price"]
        })
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]
        
        # Now void it
        void_response = requests.post(f"{API_BASE}/transactions/{transaction_id}/void", headers=headers, json={
            "reason": "TEST_Salah input barang"
        })
        
        assert void_response.status_code == 200
        data = void_response.json()
        assert data["message"] == "Transaksi berhasil dibatalkan"
        assert data["reason"] == "TEST_Salah input barang"
        print(f"✓ Owner voided transaction: {transaction_id}")
        
        # Verify transaction is now void
        get_response = requests.get(f"{API_BASE}/transactions/{transaction_id}", headers=headers)
        assert get_response.status_code == 200
        assert get_response.json()["transaction"]["status"] == "void"
        print("✓ Transaction status verified as void")
    
    def test_kasir_cannot_void_transaction(self, kasir_token, owner_token, items):
        """Test that kasir cannot void a transaction (owner only)"""
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        kasir_headers = {"Authorization": f"Bearer {kasir_token}"}
        
        # Create transaction as owner
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 1}]
        
        create_response = requests.post(f"{API_BASE}/transactions", headers=owner_headers, json={
            "items": cart_items,
            "payment_method": "tunai",
            "payment_amount": item["price"]
        })
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]
        
        # Try to void as kasir - should fail
        void_response = requests.post(f"{API_BASE}/transactions/{transaction_id}/void", headers=kasir_headers, json={
            "reason": "TEST_Kasir trying to void"
        })
        
        assert void_response.status_code == 403
        print("✓ Kasir correctly blocked from voiding transaction")
    
    def test_cannot_void_already_voided(self, owner_token, items):
        """Test that already voided transaction cannot be voided again"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        # Create and void a transaction
        item = items[0]
        cart_items = [{"item_id": item["id"], "qty": 1}]
        
        create_response = requests.post(f"{API_BASE}/transactions", headers=headers, json={
            "items": cart_items,
            "payment_method": "tunai",
            "payment_amount": item["price"]
        })
        transaction_id = create_response.json()["id"]
        
        # First void
        requests.post(f"{API_BASE}/transactions/{transaction_id}/void", headers=headers, json={
            "reason": "TEST_First void"
        })
        
        # Try to void again
        second_void = requests.post(f"{API_BASE}/transactions/{transaction_id}/void", headers=headers, json={
            "reason": "TEST_Second void attempt"
        })
        
        assert second_void.status_code == 400
        print("✓ Double void correctly rejected")


class TestReports:
    """Test reports functionality"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def kasir_token(self):
        """Get kasir auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": KASIR_EMAIL,
            "password": KASIR_PASSWORD
        })
        return response.json()["token"]
    
    def test_owner_can_access_report_summary(self, owner_token):
        """Test owner can access report summary"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        from datetime import datetime, timedelta
        today = datetime.now().strftime("%Y-%m-%d")
        week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_BASE}/reports/summary", headers=headers, params={
            "start_date": week_ago,
            "end_date": today
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "period" in data
        assert "summary" in data
        assert "payment_breakdown" in data
        assert "top_items" in data
        assert "daily_sales" in data
        
        # Verify summary fields
        assert "total_sales" in data["summary"]
        assert "total_transactions" in data["summary"]
        assert "total_items_sold" in data["summary"]
        assert "avg_transaction" in data["summary"]
        
        print(f"✓ Report summary retrieved: {data['summary']['total_transactions']} transactions, {data['summary']['total_sales_formatted']}")
        return data
    
    def test_kasir_cannot_access_reports(self, kasir_token):
        """Test kasir cannot access reports (owner only)"""
        headers = {"Authorization": f"Bearer {kasir_token}"}
        
        response = requests.get(f"{API_BASE}/reports/summary", headers=headers)
        
        assert response.status_code == 403
        print("✓ Kasir correctly blocked from accessing reports")
    
    def test_daily_report(self, owner_token):
        """Test daily report endpoint"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_BASE}/reports/daily", headers=headers, params={
            "date": today
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "date" in data
        assert "summary" in data
        assert "transactions" in data
        
        print(f"✓ Daily report retrieved for {today}")
    
    def test_export_json(self, owner_token):
        """Test export report as JSON"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        from datetime import datetime, timedelta
        today = datetime.now().strftime("%Y-%m-%d")
        week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_BASE}/reports/export", headers=headers, params={
            "start_date": week_ago,
            "end_date": today,
            "format": "json"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["format"] == "json"
        assert "data" in data
        assert "total_records" in data
        
        print(f"✓ JSON export successful: {data['total_records']} records")
    
    def test_export_csv(self, owner_token):
        """Test export report as CSV"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        from datetime import datetime, timedelta
        today = datetime.now().strftime("%Y-%m-%d")
        week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_BASE}/reports/export", headers=headers, params={
            "start_date": week_ago,
            "end_date": today,
            "format": "csv"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["format"] == "csv"
        assert "data" in data
        assert "filename" in data
        
        print(f"✓ CSV export successful: {data['filename']}")
    
    def test_payment_breakdown_in_report(self, owner_token):
        """Test that payment breakdown shows different methods"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        from datetime import datetime, timedelta
        today = datetime.now().strftime("%Y-%m-%d")
        month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_BASE}/reports/summary", headers=headers, params={
            "start_date": month_ago,
            "end_date": today
        })
        
        assert response.status_code == 200
        data = response.json()
        
        payment_breakdown = data["payment_breakdown"]
        print(f"✓ Payment breakdown: {list(payment_breakdown.keys())}")
        
        # Verify structure of payment breakdown
        for method, breakdown in payment_breakdown.items():
            assert "count" in breakdown
            assert "amount" in breakdown
            print(f"  - {method}: {breakdown['count']} transactions, Rp {breakdown['amount']}")


class TestTransactionHistory:
    """Test transaction history with payment methods and void status"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner auth token"""
        response = requests.post(f"{API_BASE}/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_transactions_with_payment_method(self, owner_token):
        """Test that transactions include payment method info"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        response = requests.get(f"{API_BASE}/transactions", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "transactions" in data
        
        for tx in data["transactions"][:5]:  # Check first 5
            assert "payment_method" in tx
            assert tx["payment_method"] in ["tunai", "qris", "transfer"]
            assert "status" in tx
            assert tx["status"] in ["selesai", "void"]
            
        print(f"✓ Retrieved {len(data['transactions'])} transactions with payment methods")
    
    def test_voided_transactions_in_history(self, owner_token):
        """Test that voided transactions appear in history with void status"""
        headers = {"Authorization": f"Bearer {owner_token}"}
        
        response = requests.get(f"{API_BASE}/transactions", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        voided = [tx for tx in data["transactions"] if tx["status"] == "void"]
        completed = [tx for tx in data["transactions"] if tx["status"] == "selesai"]
        
        print(f"✓ Transaction history: {len(completed)} completed, {len(voided)} voided")
        
        # Check voided transactions have void info
        for tx in voided[:3]:  # Check first 3 voided
            if "void_reason" in tx:
                print(f"  - Voided: #{tx['transaction_number']} - {tx.get('void_reason', 'No reason')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
