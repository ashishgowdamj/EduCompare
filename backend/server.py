from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from bson import ObjectId
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class College(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    city: str
    state: str
    country: str = "India"
    logo_base64: Optional[str] = None
    images_base64: List[str] = []
    ranking: Optional[int] = None
    star_rating: float = Field(ge=0, le=5)
    annual_fees: int
    courses_offered: List[str] = []
    established_year: int
    university_type: str  # Government/Private/Deemed
    accreditation: List[str] = []
    campus_size: str
    total_students: int
    faculty_count: int
    placement_percentage: float
    average_package: int
    highest_package: int
    hostel_facilities: bool
    library_facilities: bool
    sports_facilities: bool
    wifi: bool
    canteen: bool
    medical_facilities: bool
    description: str
    admission_process: str
    contact_email: str
    contact_phone: str
    website: str
    address: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CollegeCreate(BaseModel):
    name: str
    city: str
    state: str
    country: str = "India"
    logo_base64: Optional[str] = None
    images_base64: List[str] = []
    ranking: Optional[int] = None
    star_rating: float = Field(ge=0, le=5)
    annual_fees: int
    courses_offered: List[str] = []
    established_year: int
    university_type: str
    accreditation: List[str] = []
    campus_size: str
    total_students: int
    faculty_count: int
    placement_percentage: float
    average_package: int
    highest_package: int
    hostel_facilities: bool
    library_facilities: bool
    sports_facilities: bool
    wifi: bool
    canteen: bool
    medical_facilities: bool
    description: str
    admission_process: str
    contact_email: str
    contact_phone: str
    website: str
    address: str

class CollegeResponse(BaseModel):
    id: str
    name: str
    city: str
    state: str
    country: str
    logo_base64: Optional[str] = None
    images_base64: List[str] = []
    ranking: Optional[int] = None
    star_rating: float
    annual_fees: int
    courses_offered: List[str] = []
    established_year: int
    university_type: str
    accreditation: List[str] = []
    campus_size: str
    total_students: int
    faculty_count: int
    placement_percentage: float
    average_package: int
    highest_package: int
    hostel_facilities: bool
    library_facilities: bool
    sports_facilities: bool
    wifi: bool
    canteen: bool
    medical_facilities: bool
    description: str
    admission_process: str
    contact_email: str
    contact_phone: str
    website: str
    address: str
    created_at: datetime

class CollegeSearchResponse(BaseModel):
    colleges: List[CollegeResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class Favorite(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # For now, we'll use a simple string, later can implement proper auth
    college_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FavoriteCreate(BaseModel):
    user_id: str
    college_id: str

class Compare(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    college_ids: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CompareCreate(BaseModel):
    user_id: str
    college_ids: List[str]

# Helper function to convert ObjectId to string
def college_helper(college) -> dict:
    return {
        "id": str(college["_id"]) if "_id" in college else college.get("id"),
        "name": college["name"],
        "city": college["city"],
        "state": college["state"],
        "country": college["country"],
        "logo_base64": college.get("logo_base64"),
        "images_base64": college.get("images_base64", []),
        "ranking": college.get("ranking"),
        "star_rating": college["star_rating"],
        "annual_fees": college["annual_fees"],
        "courses_offered": college.get("courses_offered", []),
        "established_year": college["established_year"],
        "university_type": college["university_type"],
        "accreditation": college.get("accreditation", []),
        "campus_size": college["campus_size"],
        "total_students": college["total_students"],
        "faculty_count": college["faculty_count"],
        "placement_percentage": college["placement_percentage"],
        "average_package": college["average_package"],
        "highest_package": college["highest_package"],
        "hostel_facilities": college["hostel_facilities"],
        "library_facilities": college["library_facilities"],
        "sports_facilities": college["sports_facilities"],
        "wifi": college["wifi"],
        "canteen": college["canteen"],
        "medical_facilities": college["medical_facilities"],
        "description": college["description"],
        "admission_process": college["admission_process"],
        "contact_email": college["contact_email"],
        "contact_phone": college["contact_phone"],
        "website": college["website"],
        "address": college["address"],
        "created_at": college.get("created_at", datetime.utcnow())
    }

# Routes

@api_router.get("/")
async def root():
    return {"message": "College Search API"}

# College Routes
@api_router.post("/colleges", response_model=CollegeResponse)
async def create_college(college: CollegeCreate):
    college_dict = college.dict()
    result = await db.colleges.insert_one(college_dict)
    created_college = await db.colleges.find_one({"_id": result.inserted_id})
    return CollegeResponse(**college_helper(created_college))

@api_router.get("/colleges/search", response_model=CollegeSearchResponse)
async def search_colleges(
    q: Optional[str] = Query(None, description="Search query"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    min_fees: Optional[int] = Query(None, description="Minimum annual fees"),
    max_fees: Optional[int] = Query(None, description="Maximum annual fees"),
    university_type: Optional[str] = Query(None, description="University type"),
    courses: Optional[str] = Query(None, description="Comma-separated courses"),
    min_rating: Optional[float] = Query(None, description="Minimum star rating"),
    max_rating: Optional[float] = Query(None, description="Maximum star rating"),
    ranking_from: Optional[int] = Query(None, description="Ranking from"),
    ranking_to: Optional[int] = Query(None, description="Ranking to"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    # Build query filter
    filter_query = {}
    
    # Text search
    if q:
        filter_query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}},
            {"state": {"$regex": q, "$options": "i"}},
            {"courses_offered": {"$in": [re.compile(q, re.IGNORECASE)]}}
        ]
    
    # Location filters
    if city:
        filter_query["city"] = {"$regex": city, "$options": "i"}
    if state:
        filter_query["state"] = {"$regex": state, "$options": "i"}
    
    # Fees filter
    if min_fees is not None or max_fees is not None:
        fees_filter = {}
        if min_fees is not None:
            fees_filter["$gte"] = min_fees
        if max_fees is not None:
            fees_filter["$lte"] = max_fees
        filter_query["annual_fees"] = fees_filter
    
    # Rating filter
    if min_rating is not None or max_rating is not None:
        rating_filter = {}
        if min_rating is not None:
            rating_filter["$gte"] = min_rating
        if max_rating is not None:
            rating_filter["$lte"] = max_rating
        filter_query["star_rating"] = rating_filter
    
    # Ranking filter
    if ranking_from is not None or ranking_to is not None:
        ranking_filter = {}
        if ranking_from is not None:
            ranking_filter["$gte"] = ranking_from
        if ranking_to is not None:
            ranking_filter["$lte"] = ranking_to
        filter_query["ranking"] = ranking_filter
    
    # University type filter
    if university_type:
        filter_query["university_type"] = {"$regex": university_type, "$options": "i"}
    
    # Courses filter
    if courses:
        course_list = [course.strip() for course in courses.split(",")]
        filter_query["courses_offered"] = {"$in": [re.compile(course, re.IGNORECASE) for course in course_list]}
    
    # Calculate pagination
    skip = (page - 1) * limit
    
    # Get total count
    total = await db.colleges.count_documents(filter_query)
    
    # Get colleges with pagination
    cursor = db.colleges.find(filter_query).skip(skip).limit(limit)
    colleges = await cursor.to_list(length=None)
    
    # Convert to response format
    college_responses = [CollegeResponse(**college_helper(college)) for college in colleges]
    
    total_pages = (total + limit - 1) // limit
    
    return CollegeSearchResponse(
        colleges=college_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@api_router.get("/colleges/{college_id}", response_model=CollegeResponse)
async def get_college(college_id: str):
    # Try to find by ObjectId first, then by custom id
    college = None
    try:
        college = await db.colleges.find_one({"_id": ObjectId(college_id)})
    except:
        college = await db.colleges.find_one({"id": college_id})
    
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    return CollegeResponse(**college_helper(college))

# Favorites Routes
@api_router.post("/favorites")
async def add_favorite(favorite: FavoriteCreate):
    # Check if already favorited
    existing = await db.favorites.find_one({
        "user_id": favorite.user_id,
        "college_id": favorite.college_id
    })
    
    if existing:
        return {"message": "Already in favorites", "favorite_id": str(existing["_id"])}
    
    favorite_dict = favorite.dict()
    result = await db.favorites.insert_one(favorite_dict)
    return {"message": "Added to favorites", "favorite_id": str(result.inserted_id)}

@api_router.delete("/favorites/{user_id}/{college_id}")
async def remove_favorite(user_id: str, college_id: str):
    result = await db.favorites.delete_one({
        "user_id": user_id,
        "college_id": college_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@api_router.get("/favorites/{user_id}")
async def get_user_favorites(user_id: str):
    favorites = await db.favorites.find({"user_id": user_id}).to_list(length=None)
    college_ids = [fav["college_id"] for fav in favorites]
    
    # Get college details for favorites
    colleges = []
    for college_id in college_ids:
        try:
            college = await db.colleges.find_one({"_id": ObjectId(college_id)})
            if not college:
                college = await db.colleges.find_one({"id": college_id})
            if college:
                colleges.append(CollegeResponse(**college_helper(college)))
        except:
            continue
    
    return {"favorites": colleges}

# Compare Routes
@api_router.post("/compare")
async def create_comparison(compare: CompareCreate):
    if len(compare.college_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 colleges required for comparison")
    
    compare_dict = compare.dict()
    result = await db.comparisons.insert_one(compare_dict)
    return {"message": "Comparison created", "comparison_id": str(result.inserted_id)}

@api_router.get("/compare/{user_id}")
async def get_user_comparisons(user_id: str):
    comparisons = await db.comparisons.find({"user_id": user_id}).to_list(length=None)
    return {"comparisons": comparisons}

@api_router.post("/compare/colleges")
async def compare_colleges(college_ids: List[str]):
    if len(college_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 colleges required for comparison")
    
    colleges = []
    for college_id in college_ids:
        try:
            college = await db.colleges.find_one({"_id": ObjectId(college_id)})
            if not college:
                college = await db.colleges.find_one({"id": college_id})
            if college:
                colleges.append(CollegeResponse(**college_helper(college)))
        except:
            continue
    
    return {"colleges": colleges}

# Initialize dummy data
@api_router.post("/init-data")
async def initialize_dummy_data():
    # Check if data already exists
    count = await db.colleges.count_documents({})
    if count > 0:
        return {"message": f"Database already has {count} colleges"}
    
    # Dummy college data
    dummy_colleges = [
        {
            "name": "Indian Institute of Technology Delhi",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "ranking": 2,
            "star_rating": 4.8,
            "annual_fees": 250000,
            "courses_offered": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering"],
            "established_year": 1961,
            "university_type": "Government",
            "accreditation": ["NAAC A++", "NBA", "AICTE"],
            "campus_size": "320 acres",
            "total_students": 8500,
            "faculty_count": 550,
            "placement_percentage": 95.0,
            "average_package": 1500000,
            "highest_package": 5500000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "IIT Delhi is one of India's premier engineering institutes with excellent research facilities and industry connections.",
            "admission_process": "JEE Advanced",
            "contact_email": "info@iitd.ac.in",
            "contact_phone": "+91-11-26591000",
            "website": "https://home.iitd.ac.in",
            "address": "Hauz Khas, New Delhi - 110016"
        },
        {
            "name": "Indian Institute of Technology Bombay",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "ranking": 1,
            "star_rating": 4.9,
            "annual_fees": 260000,
            "courses_offered": ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Aerospace Engineering", "Metallurgy"],
            "established_year": 1958,
            "university_type": "Government",
            "accreditation": ["NAAC A++", "NBA", "AICTE"],
            "campus_size": "550 acres",
            "total_students": 10000,
            "faculty_count": 650,
            "placement_percentage": 98.0,
            "average_package": 1800000,
            "highest_package": 8500000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "IIT Bombay is India's top engineering institute known for innovation, research, and excellent placements.",
            "admission_process": "JEE Advanced",
            "contact_email": "info@iitb.ac.in",
            "contact_phone": "+91-22-25722545",
            "website": "https://www.iitb.ac.in",
            "address": "Powai, Mumbai - 400076"
        },
        {
            "name": "Manipal Institute of Technology",
            "city": "Manipal",
            "state": "Karnataka",
            "country": "India",
            "ranking": 15,
            "star_rating": 4.3,
            "annual_fees": 450000,
            "courses_offered": ["Computer Science", "Information Technology", "Mechanical Engineering", "Biotechnology", "Electronics"],
            "established_year": 1957,
            "university_type": "Private",
            "accreditation": ["NAAC A", "NBA", "AICTE"],
            "campus_size": "600 acres",
            "total_students": 28000,
            "faculty_count": 1200,
            "placement_percentage": 85.0,
            "average_package": 800000,
            "highest_package": 4500000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "MIT Manipal offers world-class education with modern infrastructure and strong industry partnerships.",
            "admission_process": "MET / JEE Main",
            "contact_email": "admissions@manipal.edu",
            "contact_phone": "+91-820-2923879",
            "website": "https://manipal.edu/mit.html",
            "address": "Manipal - 576104, Karnataka"
        },
        {
            "name": "Vellore Institute of Technology",
            "city": "Vellore",
            "state": "Tamil Nadu",
            "country": "India",
            "ranking": 12,
            "star_rating": 4.1,
            "annual_fees": 380000,
            "courses_offered": ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering", "Bioengineering"],
            "established_year": 1984,
            "university_type": "Private",
            "accreditation": ["NAAC A++", "NBA", "AICTE"],
            "campus_size": "350 acres",
            "total_students": 40000,
            "faculty_count": 2500,
            "placement_percentage": 80.0,
            "average_package": 750000,
            "highest_package": 4100000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "VIT is a leading private university known for its diverse student body and excellent placement record.",
            "admission_process": "VITEEE",
            "contact_email": "admissions@vit.ac.in",
            "contact_phone": "+91-416-2202020",
            "website": "https://vit.ac.in",
            "address": "Vellore - 632014, Tamil Nadu"
        },
        {
            "name": "Birla Institute of Technology and Science Pilani",
            "city": "Pilani",
            "state": "Rajasthan",
            "country": "India",
            "ranking": 8,
            "star_rating": 4.6,
            "annual_fees": 420000,
            "courses_offered": ["Computer Science", "Electronics", "Mechanical Engineering", "Chemical Engineering", "Civil Engineering"],
            "established_year": 1964,
            "university_type": "Private",
            "accreditation": ["NAAC A", "NBA", "AICTE"],
            "campus_size": "328 acres",
            "total_students": 18000,
            "faculty_count": 900,
            "placement_percentage": 92.0,
            "average_package": 1200000,
            "highest_package": 5800000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "BITS Pilani is a prestigious private institute known for academic excellence and innovation.",
            "admission_process": "BITSAT",
            "contact_email": "admission@pilani.bits-pilani.ac.in",
            "contact_phone": "+91-1596-242210",
            "website": "https://www.bits-pilani.ac.in",
            "address": "Vidya Vihar, Pilani - 333031, Rajasthan"
        },
        {
            "name": "Jadavpur University",
            "city": "Kolkata",
            "state": "West Bengal",
            "country": "India",
            "ranking": 18,
            "star_rating": 4.2,
            "annual_fees": 15000,
            "courses_offered": ["Computer Science", "Electronics", "Mechanical Engineering", "Civil Engineering", "Architecture"],
            "established_year": 1955,
            "university_type": "Government",
            "accreditation": ["NAAC A", "NBA", "AICTE"],
            "campus_size": "58 acres",
            "total_students": 12000,
            "faculty_count": 450,
            "placement_percentage": 78.0,
            "average_package": 650000,
            "highest_package": 3200000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "Jadavpur University is known for its strong engineering programs and research contributions.",
            "admission_process": "JEE Main / WBJEE",
            "contact_email": "registrar@jadavpuruniversity.in",
            "contact_phone": "+91-33-24146666",
            "website": "http://www.jaduniv.edu.in",
            "address": "188, Raja S.C. Mallick Rd, Kolkata - 700032"
        },
        {
            "name": "National Institute of Technology Trichy",
            "city": "Tiruchirappalli",
            "state": "Tamil Nadu",
            "country": "India",
            "ranking": 6,
            "star_rating": 4.5,
            "annual_fees": 180000,
            "courses_offered": ["Computer Science", "Electronics", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering"],
            "established_year": 1964,
            "university_type": "Government",
            "accreditation": ["NAAC A++", "NBA", "AICTE"],
            "campus_size": "800 acres",
            "total_students": 9500,
            "faculty_count": 520,
            "placement_percentage": 88.0,
            "average_package": 1100000,
            "highest_package": 4800000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "NIT Trichy is one of the premier NITs known for excellent academics and placements.",
            "admission_process": "JEE Main",
            "contact_email": "dean.aa@nitt.edu",
            "contact_phone": "+91-431-2503000",
            "website": "https://www.nitt.edu",
            "address": "National Highway 67, Tiruchirappalli - 620015"
        },
        {
            "name": "Delhi Technological University",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "ranking": 25,
            "star_rating": 4.0,
            "annual_fees": 160000,
            "courses_offered": ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering", "Civil Engineering"],
            "established_year": 1941,
            "university_type": "Government",
            "accreditation": ["NAAC A+", "NBA", "AICTE"],
            "campus_size": "164 acres",
            "total_students": 7500,
            "faculty_count": 400,
            "placement_percentage": 75.0,
            "average_package": 700000,
            "highest_package": 3800000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "DTU is a leading technical university in Delhi with strong industry connections.",
            "admission_process": "JEE Main",
            "contact_email": "admission@dtu.ac.in",
            "contact_phone": "+91-11-27871000",
            "website": "http://dtu.ac.in",
            "address": "Bawana Road, Delhi - 110042"
        },
        {
            "name": "Indian Institute of Information Technology Hyderabad",
            "city": "Hyderabad",
            "state": "Telangana",
            "country": "India",
            "ranking": 10,
            "star_rating": 4.4,
            "annual_fees": 320000,
            "courses_offered": ["Computer Science", "Electronics", "Data Science", "Artificial Intelligence", "Computational Engineering"],
            "established_year": 1998,
            "university_type": "Government",
            "accreditation": ["NAAC A++", "NBA", "AICTE"],
            "campus_size": "62 acres",
            "total_students": 2000,
            "faculty_count": 150,
            "placement_percentage": 95.0,
            "average_package": 1600000,
            "highest_package": 7400000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "IIIT Hyderabad is a research-focused institute specializing in IT and computer science.",
            "admission_process": "JEE Main / UGEE",
            "contact_email": "admissions@iiit.ac.in",
            "contact_phone": "+91-40-66531000",
            "website": "https://www.iiit.ac.in",
            "address": "Gachibowli, Hyderabad - 500032"
        },
        {
            "name": "SRM Institute of Science and Technology",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "country": "India",
            "ranking": 28,
            "star_rating": 3.8,
            "annual_fees": 350000,
            "courses_offered": ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering", "Biotechnology"],
            "established_year": 1985,
            "university_type": "Private",
            "accreditation": ["NAAC A++", "NBA", "AICTE"],
            "campus_size": "250 acres",
            "total_students": 50000,
            "faculty_count": 3000,
            "placement_percentage": 70.0,
            "average_package": 550000,
            "highest_package": 2800000,
            "hostel_facilities": True,
            "library_facilities": True,
            "sports_facilities": True,
            "wifi": True,
            "canteen": True,
            "medical_facilities": True,
            "description": "SRM is a large private university known for its diverse programs and international collaborations.",
            "admission_process": "SRMJEEE",
            "contact_email": "admission@srmist.edu.in",
            "contact_phone": "+91-44-47437000",
            "website": "https://www.srmist.edu.in",
            "address": "Kattankulathur - 603203, Tamil Nadu"
        }
    ]
    
    # Insert dummy data
    result = await db.colleges.insert_many(dummy_colleges)
    return {"message": f"Successfully inserted {len(result.inserted_ids)} colleges"}

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()