import requests
import sys
import base64
import io
from datetime import datetime

class LuxeDesignAPITester:
    def __init__(self, base_url="https://luxe-design-studio-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, response_type='json'):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=60)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response_type == 'json':
                    try:
                        return success, response.json()
                    except:
                        return success, {}
                else:
                    return success, response.content
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_generate_image_simple(self):
        """Test image generation with simple prompt"""
        success, response = self.run_test(
            "Generate Image - Simple Prompt",
            "POST",
            "generate",
            200,
            data={"prompt": "A beautiful luxury wedding venue with elegant decorations"}
        )
        if success and response.get('success'):
            print(f"   Generated image: {len(response.get('image_data', ''))} chars")
            return True, response.get('image_data')
        return False, None

    def test_generate_image_with_filters(self):
        """Test image generation with filters"""
        success, response = self.run_test(
            "Generate Image - With Filters",
            "POST",
            "generate",
            200,
            data={
                "prompt": "Elegant wedding reception hall",
                "function_type": "Reception",
                "theme": "Traditional",
                "space": "Hall"
            }
        )
        if success and response.get('success'):
            print(f"   Generated image with filters: {len(response.get('image_data', ''))} chars")
            return True, response.get('image_data')
        return False, None

    def test_generate_with_reference_image(self):
        """Test image generation with reference image"""
        # Create a small test image in base64
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        success, response = self.run_test(
            "Generate Image - With Reference",
            "POST",
            "generate",
            200,
            data={
                "prompt": "Modern wedding venue inspired by reference",
                "reference_image": test_image_b64
            }
        )
        if success and response.get('success'):
            print(f"   Generated image with reference: {len(response.get('image_data', ''))} chars")
            return True, response.get('image_data')
        return False, None

    def test_download_pdf(self):
        """Test PDF download with sample images"""
        # Use a small test image
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        success, response = self.run_test(
            "Download PDF",
            "POST",
            "moodboard/download-pdf",
            200,
            data={
                "images": [
                    {"image_data": test_image_b64, "prompt": "Test venue design 1"},
                    {"image_data": test_image_b64, "prompt": "Test venue design 2"}
                ]
            },
            response_type='binary'
        )
        if success:
            print(f"   PDF size: {len(response)} bytes")
        return success

    def test_download_ppt(self):
        """Test PPT download with sample images"""
        # Use a small test image
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        success, response = self.run_test(
            "Download PPT",
            "POST",
            "moodboard/download-ppt",
            200,
            data={
                "images": [
                    {"image_data": test_image_b64, "prompt": "Test venue design 1"},
                    {"image_data": test_image_b64, "prompt": "Test venue design 2"}
                ]
            },
            response_type='binary'
        )
        if success:
            print(f"   PPT size: {len(response)} bytes")
        return success

    def test_error_handling(self):
        """Test API error handling"""
        success, response = self.run_test(
            "Error Handling - Empty Prompt",
            "POST",
            "generate",
            200,
            data={"prompt": ""}
        )
        # Should return success=False in response
        if success and not response.get('success'):
            print("   ✅ Correctly handled empty prompt")
            return True
        return False

def main():
    print("🚀 Starting Luxe Design Studio API Tests")
    print("=" * 50)
    
    tester = LuxeDesignAPITester()
    
    # Test basic connectivity
    if not tester.test_root_endpoint():
        print("❌ Root endpoint failed, stopping tests")
        return 1

    # Test image generation
    print("\n📸 Testing Image Generation...")
    simple_success, simple_image = tester.test_generate_image_simple()
    filter_success, filter_image = tester.test_generate_image_with_filters()
    ref_success, ref_image = tester.test_generate_with_reference_image()

    # Test downloads
    print("\n📄 Testing Download Functionality...")
    pdf_success = tester.test_download_pdf()
    ppt_success = tester.test_download_ppt()

    # Test error handling
    print("\n🛡️ Testing Error Handling...")
    error_success = tester.test_error_handling()

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())