#!/usr/bin/env python3
"""
Backend API Testing Suite for College Search Application
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
import time
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://educompare.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class CollegeAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.college_ids = []  # Store college IDs for testing
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Root endpoint", True, f"Response: {data['message']}")
                else:
                    self.log_test("Root endpoint", False, "Missing message in response")
            else:
                self.log_test("Root endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Root endpoint", False, f"Exception: {str(e)}")

    def test_init_data(self):
        """Test initializing dummy data"""
        try:
            response = self.session.post(f"{self.base_url}/init-data")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Initialize dummy data", True, f"Response: {data.get('message', 'Success')}")
            else:
                self.log_test("Initialize dummy data", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Initialize dummy data", False, f"Exception: {str(e)}")

    def test_search_colleges_basic(self):
        """Test basic college search without filters"""
        try:
            response = self.session.get(f"{self.base_url}/colleges/search")
            if response.status_code == 200:
                data = response.json()
                if "colleges" in data and "total" in data:
                    colleges_count = len(data["colleges"])
                    total = data["total"]
                    # Store some college IDs for later tests
                    if colleges_count > 0:
                        self.college_ids = [college["id"] for college in data["colleges"][:3]]
                    self.log_test("Basic college search", True, f"Found {colleges_count} colleges out of {total} total")
                else:
                    self.log_test("Basic college search", False, "Missing required fields in response")
            else:
                self.log_test("Basic college search", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Basic college search", False, f"Exception: {str(e)}")

    def test_search_by_name(self):
        """Test searching colleges by name"""
        try:
            # Search for IIT colleges using full name
            response = self.session.get(f"{self.base_url}/colleges/search?q=Indian Institute of Technology")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                iit_found = any("Indian Institute of Technology" in college["name"] for college in colleges)
                if iit_found:
                    self.log_test("Search by name (Indian Institute of Technology)", True, f"Found {len(colleges)} IIT colleges")
                else:
                    self.log_test("Search by name (Indian Institute of Technology)", False, "No IIT colleges found in search results")
            else:
                self.log_test("Search by name (Indian Institute of Technology)", False, f"Status code: {response.status_code}")

            # Test search with partial name
            response = self.session.get(f"{self.base_url}/colleges/search?q=Technology")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                tech_found = any("Technology" in college["name"] for college in colleges)
                if tech_found:
                    self.log_test("Search by name (Technology)", True, f"Found {len(colleges)} colleges with 'Technology'")
                else:
                    self.log_test("Search by name (Technology)", False, "No colleges with 'Technology' found")
            else:
                self.log_test("Search by name (Technology)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by name", False, f"Exception: {str(e)}")

    def test_search_by_location(self):
        """Test searching colleges by location"""
        try:
            # Search by city
            response = self.session.get(f"{self.base_url}/colleges/search?city=Mumbai")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                mumbai_colleges = [c for c in colleges if "Mumbai" in c.get("city", "")]
                if mumbai_colleges:
                    self.log_test("Search by city (Mumbai)", True, f"Found {len(mumbai_colleges)} colleges in Mumbai")
                else:
                    self.log_test("Search by city (Mumbai)", False, "No colleges found in Mumbai")
            else:
                self.log_test("Search by city (Mumbai)", False, f"Status code: {response.status_code}")

            # Search by state
            response = self.session.get(f"{self.base_url}/colleges/search?state=Tamil Nadu")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                tn_colleges = [c for c in colleges if "Tamil Nadu" in c.get("state", "")]
                if tn_colleges:
                    self.log_test("Search by state (Tamil Nadu)", True, f"Found {len(tn_colleges)} colleges in Tamil Nadu")
                else:
                    self.log_test("Search by state (Tamil Nadu)", False, "No colleges found in Tamil Nadu")
            else:
                self.log_test("Search by state (Tamil Nadu)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by location", False, f"Exception: {str(e)}")

    def test_search_by_fees(self):
        """Test searching colleges by fees range"""
        try:
            # Search for colleges with fees between 100k-300k
            response = self.session.get(f"{self.base_url}/colleges/search?min_fees=100000&max_fees=300000")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                valid_fees = all(100000 <= college.get("annual_fees", 0) <= 300000 for college in colleges)
                if valid_fees and colleges:
                    self.log_test("Search by fees range", True, f"Found {len(colleges)} colleges in 1L-3L range")
                elif not colleges:
                    self.log_test("Search by fees range", True, "No colleges in specified fee range (valid result)")
                else:
                    self.log_test("Search by fees range", False, "Some colleges outside fee range returned")
            else:
                self.log_test("Search by fees range", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by fees range", False, f"Exception: {str(e)}")

    def test_search_by_rating(self):
        """Test searching colleges by rating"""
        try:
            # Search for colleges with rating >= 4.5
            response = self.session.get(f"{self.base_url}/colleges/search?min_rating=4.5")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                valid_ratings = all(college.get("star_rating", 0) >= 4.5 for college in colleges)
                if valid_ratings:
                    self.log_test("Search by rating (>=4.5)", True, f"Found {len(colleges)} high-rated colleges")
                else:
                    self.log_test("Search by rating (>=4.5)", False, "Some colleges with lower ratings returned")
            else:
                self.log_test("Search by rating (>=4.5)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by rating", False, f"Exception: {str(e)}")

    def test_search_by_ranking(self):
        """Test searching colleges by ranking"""
        try:
            # Search for top 10 ranked colleges
            response = self.session.get(f"{self.base_url}/colleges/search?ranking_from=1&ranking_to=10")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                valid_rankings = all(1 <= college.get("ranking", 999) <= 10 for college in colleges if college.get("ranking"))
                if valid_rankings:
                    self.log_test("Search by ranking (1-10)", True, f"Found {len(colleges)} top-ranked colleges")
                else:
                    self.log_test("Search by ranking (1-10)", False, "Some colleges outside ranking range returned")
            else:
                self.log_test("Search by ranking (1-10)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by ranking", False, f"Exception: {str(e)}")

    def test_search_by_university_type(self):
        """Test searching colleges by university type"""
        try:
            # Search for government colleges
            response = self.session.get(f"{self.base_url}/colleges/search?university_type=Government")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                govt_colleges = [c for c in colleges if "Government" in c.get("university_type", "")]
                if govt_colleges:
                    self.log_test("Search by university type (Government)", True, f"Found {len(govt_colleges)} government colleges")
                else:
                    self.log_test("Search by university type (Government)", False, "No government colleges found")
            else:
                self.log_test("Search by university type (Government)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by university type", False, f"Exception: {str(e)}")

    def test_search_by_courses(self):
        """Test searching colleges by courses"""
        try:
            # Search for colleges offering Computer Science
            response = self.session.get(f"{self.base_url}/colleges/search?courses=Computer Science")
            if response.status_code == 200:
                data = response.json()
                colleges = data.get("colleges", [])
                cs_colleges = [c for c in colleges if any("Computer Science" in course for course in c.get("courses_offered", []))]
                if cs_colleges:
                    self.log_test("Search by courses (Computer Science)", True, f"Found {len(cs_colleges)} colleges offering CS")
                else:
                    self.log_test("Search by courses (Computer Science)", False, "No colleges offering Computer Science found")
            else:
                self.log_test("Search by courses (Computer Science)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Search by courses", False, f"Exception: {str(e)}")

    def test_pagination(self):
        """Test pagination in search results"""
        try:
            # Test first page with limit 5
            response = self.session.get(f"{self.base_url}/colleges/search?page=1&limit=5")
            if response.status_code == 200:
                data = response.json()
                if data.get("page") == 1 and data.get("limit") == 5 and len(data.get("colleges", [])) <= 5:
                    self.log_test("Pagination (page 1, limit 5)", True, f"Returned {len(data['colleges'])} colleges")
                else:
                    self.log_test("Pagination (page 1, limit 5)", False, "Pagination parameters not respected")
            else:
                self.log_test("Pagination (page 1, limit 5)", False, f"Status code: {response.status_code}")

            # Test second page
            response = self.session.get(f"{self.base_url}/colleges/search?page=2&limit=3")
            if response.status_code == 200:
                data = response.json()
                if data.get("page") == 2 and data.get("limit") == 3:
                    self.log_test("Pagination (page 2, limit 3)", True, f"Returned {len(data['colleges'])} colleges")
                else:
                    self.log_test("Pagination (page 2, limit 3)", False, "Pagination parameters not respected")
            else:
                self.log_test("Pagination (page 2, limit 3)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Pagination", False, f"Exception: {str(e)}")

    def test_get_specific_college(self):
        """Test getting a specific college by ID"""
        if not self.college_ids:
            self.log_test("Get specific college", False, "No college IDs available for testing")
            return

        try:
            college_id = self.college_ids[0]
            response = self.session.get(f"{self.base_url}/colleges/{college_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == college_id and "name" in data:
                    self.log_test("Get specific college", True, f"Retrieved college: {data['name']}")
                else:
                    self.log_test("Get specific college", False, "Invalid college data returned")
            else:
                self.log_test("Get specific college", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get specific college", False, f"Exception: {str(e)}")

    def test_get_invalid_college(self):
        """Test getting a college with invalid ID"""
        try:
            response = self.session.get(f"{self.base_url}/colleges/invalid-college-id-12345")
            if response.status_code == 404:
                self.log_test("Get invalid college (error handling)", True, "Correctly returned 404 for invalid ID")
            else:
                self.log_test("Get invalid college (error handling)", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Get invalid college (error handling)", False, f"Exception: {str(e)}")

    def test_favorites_functionality(self):
        """Test favorites functionality"""
        if not self.college_ids:
            self.log_test("Favorites functionality", False, "No college IDs available for testing")
            return

        user_id = "test_user_123"
        college_id = self.college_ids[0]

        try:
            # Add to favorites
            payload = {"user_id": user_id, "college_id": college_id}
            response = self.session.post(f"{self.base_url}/favorites", json=payload)
            if response.status_code == 200:
                data = response.json()
                if "favorite_id" in data:
                    self.log_test("Add to favorites", True, f"Added college to favorites: {data['message']}")
                else:
                    self.log_test("Add to favorites", False, "Missing favorite_id in response")
            else:
                self.log_test("Add to favorites", False, f"Status code: {response.status_code}")

            # Get user favorites
            response = self.session.get(f"{self.base_url}/favorites/{user_id}")
            if response.status_code == 200:
                data = response.json()
                if "favorites" in data and len(data["favorites"]) > 0:
                    self.log_test("Get user favorites", True, f"Retrieved {len(data['favorites'])} favorites")
                else:
                    self.log_test("Get user favorites", False, "No favorites returned")
            else:
                self.log_test("Get user favorites", False, f"Status code: {response.status_code}")

            # Remove from favorites
            response = self.session.delete(f"{self.base_url}/favorites/{user_id}/{college_id}")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Remove from favorites", True, f"Removed from favorites: {data['message']}")
            else:
                self.log_test("Remove from favorites", False, f"Status code: {response.status_code}")

            # Try to remove non-existent favorite (error handling)
            response = self.session.delete(f"{self.base_url}/favorites/{user_id}/non-existent-id")
            if response.status_code == 404:
                self.log_test("Remove non-existent favorite (error handling)", True, "Correctly returned 404")
            else:
                self.log_test("Remove non-existent favorite (error handling)", False, f"Expected 404, got {response.status_code}")

        except Exception as e:
            self.log_test("Favorites functionality", False, f"Exception: {str(e)}")

    def test_compare_functionality(self):
        """Test compare functionality"""
        if len(self.college_ids) < 2:
            self.log_test("Compare functionality", False, "Need at least 2 college IDs for testing")
            return

        try:
            # Test compare colleges with valid IDs
            college_ids = self.college_ids[:2]
            response = self.session.post(f"{self.base_url}/compare/colleges", json=college_ids)
            if response.status_code == 200:
                data = response.json()
                if "colleges" in data and len(data["colleges"]) == len(college_ids):
                    self.log_test("Compare colleges", True, f"Successfully compared {len(data['colleges'])} colleges")
                else:
                    self.log_test("Compare colleges", False, "Incorrect number of colleges returned")
            else:
                self.log_test("Compare colleges", False, f"Status code: {response.status_code}")

            # Test compare with insufficient colleges (error handling)
            response = self.session.post(f"{self.base_url}/compare/colleges", json=[college_ids[0]])
            if response.status_code == 400:
                self.log_test("Compare insufficient colleges (error handling)", True, "Correctly returned 400 for single college")
            else:
                self.log_test("Compare insufficient colleges (error handling)", False, f"Expected 400, got {response.status_code}")

        except Exception as e:
            self.log_test("Compare functionality", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("COLLEGE SEARCH API BACKEND TESTING")
        print("=" * 60)
        print(f"Testing API at: {self.base_url}")
        print()

        # Basic connectivity and setup
        self.test_root_endpoint()
        self.test_init_data()
        
        # Search functionality tests
        self.test_search_colleges_basic()
        self.test_search_by_name()
        self.test_search_by_location()
        self.test_search_by_fees()
        self.test_search_by_rating()
        self.test_search_by_ranking()
        self.test_search_by_university_type()
        self.test_search_by_courses()
        self.test_pagination()
        
        # Individual college tests
        self.test_get_specific_college()
        self.test_get_invalid_college()
        
        # Features tests
        self.test_favorites_functionality()
        self.test_compare_functionality()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        if failed > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
            print()
        
        print("DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")

if __name__ == "__main__":
    tester = CollegeAPITester()
    tester.run_all_tests()