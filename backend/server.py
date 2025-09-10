from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime
from bson import ObjectId
import re
from recommendation_engine import RecommendationEngine
import io
import csv
import random
import json
import urllib.request

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

# Initialize recommendation engine
recommendation_engine = RecommendationEngine()

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
    # Deep profile fields (optional)
    course_fees: Optional[List[Dict[str, Any]]] = []  # [{program, duration, fees, eligibility}]
    placement_stats: Optional[List[Dict[str, Any]]] = []  # [{year, avg_package, median_package, placement_percentage}]
    recruiters: Optional[List[str]] = []
    gallery_urls: Optional[List[str]] = []
    # New optional enrichment fields
    departments: Optional[List[str]] = []
    campus_life: Optional[List[str]] = []  # e.g., clubs, fests, amenities highlights
    video_urls: Optional[List[str]] = []    # MP4/YouTube links

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
    course_fees: Optional[List[Dict[str, Any]]] = []
    placement_stats: Optional[List[Dict[str, Any]]] = []
    recruiters: Optional[List[str]] = []
    gallery_urls: Optional[List[str]] = []
    departments: Optional[List[str]] = []
    campus_life: Optional[List[str]] = []
    video_urls: Optional[List[str]] = []

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
    course_fees: List[Dict[str, Any]] = []
    placement_stats: List[Dict[str, Any]] = []
    recruiters: List[str] = []
    gallery_urls: List[str] = []
    departments: List[str] = []
    campus_life: List[str] = []
    video_urls: List[str] = []

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

# Reviews Models
class ReviewBase(BaseModel):
    college_id: str
    user_id: str
    title: Optional[str] = None
    body: Optional[str] = None
    rating_overall: float = Field(ge=0, le=5)
    rating_academics: Optional[float] = Field(default=None, ge=0, le=5)
    rating_placements: Optional[float] = Field(default=None, ge=0, le=5)
    rating_infra: Optional[float] = Field(default=None, ge=0, le=5)
    rating_faculty: Optional[float] = Field(default=None, ge=0, le=5)
    pros: Optional[List[str]] = []
    cons: Optional[List[str]] = []
    verified: bool = False

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    helpful_count: int = 0
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

class UserPreferences(BaseModel):
    academicPercentage: Optional[float] = None
    preferredCourses: List[str] = []
    budgetRange: Dict[str, int] = {"min": 0, "max": 1000000}
    preferredStates: List[str] = []
    preferredCities: List[str] = []
    universityTypes: List[str] = []
    minRating: Optional[float] = None
    placementPriority: int = 3
    feesPriority: int = 3
    rankingPriority: int = 3
    entranceExams: List[str] = []

class BrowsingHistoryItem(BaseModel):
    collegeId: str
    action: str  # 'view', 'favorite', 'compare', 'search'
    duration: Optional[int] = None

class RecommendationRequest(BaseModel):
    user_id: str
    preferences: UserPreferences
    browsing_history: List[BrowsingHistoryItem] = []
    limit: int = 10

# Cutoffs & Seats Models
class Cutoff(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    college_id: str
    year: int
    round: Optional[int] = None
    exam: str
    category: Optional[str] = None
    branch: str
    closing_rank: Optional[int] = None
    closing_percentile: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CutoffCreate(Cutoff):
    pass

class Seat(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    college_id: str
    year: int
    branch: str
    category: Optional[str] = None
    intake: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SeatCreate(Seat):
    pass

# Lead / Enquiry Model
class Lead(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    college_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    user_id: Optional[str] = None
    source: Optional[str] = "app"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Saved Searches
class SavedSearch(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    query: Optional[str] = None
    filters: Dict[str, Any] = {}
    alerts_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

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
        "created_at": college.get("created_at", datetime.utcnow()),
        "course_fees": college.get("course_fees", []),
        "placement_stats": college.get("placement_stats", []),
        "recruiters": college.get("recruiters", []),
        "gallery_urls": college.get("gallery_urls", []),
        "departments": college.get("departments", []),
        "campus_life": college.get("campus_life", []),
        "video_urls": college.get("video_urls", []),
    }

def _fill_defaults_for_college(data: Dict[str, Any]) -> Dict[str, Any]:
    """Fill required College fields with sensible defaults if missing for bulk imports."""
    now_year = datetime.utcnow().year
    name = data.get("name", "Unnamed College")
    city = data.get("city", "City")
    state = data.get("state", "State")
    website = data.get("website") or f"https://{name.lower().replace(' ','')}.edu"
    uni_type = data.get("university_type") or random.choice(["Government","Private","Deemed"])
    # Defaults
    defaults: Dict[str, Any] = {
        "country": "India",
        "ranking": data.get("ranking") or random.randint(1, 500),
        "star_rating": float(data.get("star_rating") or round(random.uniform(3.2, 4.8), 1)),
        "annual_fees": int(data.get("annual_fees") or random.randint(90000, 350000)),
        "courses_offered": data.get("courses_offered") or ["Computer Science","Electronics","Mechanical Engineering","Civil Engineering"],
        "established_year": int(data.get("established_year") or random.randint(1950, now_year-5)),
        "university_type": uni_type,
        "accreditation": data.get("accreditation") or ["AICTE"],
        "campus_size": data.get("campus_size") or f"{random.randint(30, 300)} acres",
        "total_students": int(data.get("total_students") or random.randint(2000, 30000)),
        "faculty_count": int(data.get("faculty_count") or random.randint(150, 1200)),
        "placement_percentage": float(data.get("placement_percentage") or round(random.uniform(55.0, 96.0), 1)),
        "average_package": int(data.get("average_package") or random.randint(450000, 1500000)),
        "highest_package": int(data.get("highest_package") or random.randint(1500000, 6000000)),
        "hostel_facilities": bool(data.get("hostel_facilities") if data.get("hostel_facilities") is not None else random.choice([True, True, False])),
        "library_facilities": bool(data.get("library_facilities") if data.get("library_facilities") is not None else True),
        "sports_facilities": bool(data.get("sports_facilities") if data.get("sports_facilities") is not None else random.choice([True, True, False])),
        "wifi": bool(data.get("wifi") if data.get("wifi") is not None else True),
        "canteen": bool(data.get("canteen") if data.get("canteen") is not None else True),
        "medical_facilities": bool(data.get("medical_facilities") if data.get("medical_facilities") is not None else random.choice([True, False])),
        "description": data.get("description") or f"{name} is a higher education institute in {city}, {state}.",
        "admission_process": data.get("admission_process") or random.choice(["JEE Main","State CET","Institutional Exam"]),
        "contact_email": data.get("contact_email") or f"info@{name.lower().replace(' ','')}.edu",
        "contact_phone": data.get("contact_phone") or f"+91-{random.randint(100,999)}-{random.randint(1000000,9999999)}",
        "website": website,
        "address": data.get("address") or f"{city}, {state}, India",
        "gallery_urls": data.get("gallery_urls") or [],
        "images_base64": data.get("images_base64") or [],
        "recruiters": data.get("recruiters") or [],
        "course_fees": data.get("course_fees") or [],
        "placement_stats": data.get("placement_stats") or [],
    }
    # Preserve provided fields
    merged = {**defaults, **data}
    # Ensure required core fields are present
    for key in ["name","city","state","star_rating","annual_fees","courses_offered","established_year","university_type",
                "campus_size","total_students","faculty_count","placement_percentage","average_package","highest_package",
                "hostel_facilities","library_facilities","sports_facilities","wifi","canteen","medical_facilities",
                "description","admission_process","contact_email","contact_phone","website","address"]:
        if merged.get(key) is None:
            # fallback if something slipped through
            merged[key] = defaults[key]
    return merged

# Routes

@api_router.get("/")
async def root():
    return {"message": "College Search API"}

@app.on_event("startup")
async def create_indexes():
    try:
        # Basic field indexes for filtering and sorting
        await db.colleges.create_index([("name", 1)])
        await db.colleges.create_index([("city", 1)])
        await db.colleges.create_index([("state", 1)])
        await db.colleges.create_index([("annual_fees", 1)])
        await db.colleges.create_index([("star_rating", -1)])
        await db.colleges.create_index([("ranking", 1)])
        await db.colleges.create_index([("courses_offered", 1)])  # multikey index
        await db.colleges.create_index([("accreditation", 1)])     # multikey index
        await db.colleges.create_index([("placement_percentage", -1)])
        await db.colleges.create_index([("average_package", -1)])
        # Reviews indexes
        await db.reviews.create_index([("college_id", 1), ("created_at", -1)])
        await db.reviews.create_index([("user_id", 1), ("college_id", 1)])
        # Cutoffs & Seats indexes
        await db.cutoffs.create_index([("college_id", 1), ("year", -1), ("exam", 1), ("category", 1), ("branch", 1), ("round", 1)])
        await db.seats.create_index([("college_id", 1), ("year", -1), ("branch", 1), ("category", 1)])
    except Exception as e:
        logging.getLogger(__name__).warning(f"Index creation failed or already exists: {e}")

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
    accreditation: Optional[str] = Query(None, description="Comma-separated accreditations (e.g., NAAC A++,NBA)"),
    hostel: Optional[bool] = Query(None, description="Require hostel facilities"),
    wifi: Optional[bool] = Query(None, description="Require WiFi"),
    library: Optional[bool] = Query(None, description="Require library"),
    sports: Optional[bool] = Query(None, description="Require sports"),
    canteen: Optional[bool] = Query(None, description="Require canteen"),
    medical: Optional[bool] = Query(None, description="Require medical facilities"),
    min_placement: Optional[float] = Query(None, description="Minimum placement percentage"),
    min_avg_package: Optional[int] = Query(None, description="Minimum average package (₹)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: Optional[str] = Query("relevance", description="Sort key: relevance|ranking|fees_low|fees_high|rating_high"),
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

    # Accreditation filter (any match)
    if accreditation:
        acc_list = [acc.strip() for acc in accreditation.split(",") if acc.strip()]
        if acc_list:
            filter_query["accreditation"] = {"$in": [re.compile(acc, re.IGNORECASE) for acc in acc_list]}

    # Facilities (booleans)
    facilities_map = {
        "hostel_facilities": hostel,
        "wifi": wifi,
        "library_facilities": library,
        "sports_facilities": sports,
        "canteen": canteen,
        "medical_facilities": medical,
    }
    for field, value in facilities_map.items():
        if value is True:
            filter_query[field] = True

    # Placement and average package thresholds
    if min_placement is not None:
        filter_query["placement_percentage"] = {"$gte": float(min_placement)}
    if min_avg_package is not None:
        filter_query["average_package"] = {"$gte": int(min_avg_package)}
    
    # Calculate pagination
    skip = (page - 1) * limit
    
    # Get total count
    total = await db.colleges.count_documents(filter_query)
    
    # Build sorting
    sort_fields = None
    if sort and sort != "relevance":
        if sort == "ranking":
            sort_fields = [("ranking", 1)]  # lower rank number first (best first)
        elif sort == "fees_low":
            sort_fields = [("annual_fees", 1)]
        elif sort == "fees_high":
            sort_fields = [("annual_fees", -1)]
        elif sort == "rating_high":
            sort_fields = [("star_rating", -1)]

    # Get colleges with sorting + pagination
    cursor = db.colleges.find(filter_query)
    if sort_fields:
        cursor = cursor.sort(sort_fields)
    cursor = cursor.skip(skip).limit(limit)
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

# Cutoffs Routes
@api_router.post("/cutoffs")
async def create_cutoff(cutoff: CutoffCreate):
    data = cutoff.dict()
    result = await db.cutoffs.insert_one(data)
    return {"message": "Cutoff created", "id": str(result.inserted_id)}

@api_router.get("/cutoffs")
async def list_cutoffs(
    college_id: Optional[str] = None,
    year: Optional[int] = None,
    exam: Optional[Union[str, List[str]]] = Query(default=None),
    category: Optional[Union[str, List[str]]] = Query(default=None),
    branch: Optional[Union[str, List[str]]] = Query(default=None),
    round: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("recent")
):
    query: Dict[str, Any] = {}
    if college_id: query["college_id"] = college_id
    if year is not None: query["year"] = year
    def to_list(val: Optional[Union[str, List[str]]]):
        if val is None:
            return None
        if isinstance(val, list):
            return val
        if "," in val:
            return [v.strip() for v in val.split(",") if v.strip()]
        return [val]

    exams = to_list(exam)
    cats = to_list(category)
    branches = to_list(branch)
    if exams:
        query["exam"] = {"$in": exams}
    if cats:
        query["category"] = {"$in": cats}
    if branches:
        query["branch"] = {"$in": branches}
    if round is not None: query["round"] = round

    skip = (page - 1) * limit
    sort_spec = [("year", -1), ("round", -1)] if sort == "recent" else [("closing_rank", 1)]
    cursor = db.cutoffs.find(query).sort(sort_spec).skip(skip).limit(limit)
    items = await cursor.to_list(length=None)
    total = await db.cutoffs.count_documents(query)
    # Coerce id
    for it in items:
      if "id" not in it:
        it["id"] = str(it.get("_id", ""))
    return {"items": items, "page": page, "limit": limit, "total": total}

@api_router.get("/cutoffs/options")
async def get_cutoff_options(college_id: Optional[str] = None):
    query: Dict[str, Any] = {}
    if college_id:
        query["college_id"] = college_id
    years = await db.cutoffs.distinct("year", query)
    exams = await db.cutoffs.distinct("exam", query)
    categories = await db.cutoffs.distinct("category", query)
    branches = await db.cutoffs.distinct("branch", query)
    # Clean/Sort
    years_sorted = sorted([y for y in years if y is not None], reverse=True)
    exams_sorted = sorted([e for e in exams if e], key=lambda s: s.lower())
    categories_sorted = sorted([c for c in categories if c], key=lambda s: s.lower())
    branches_sorted = sorted([b for b in branches if b], key=lambda s: s.lower())
    return {
        "years": years_sorted,
        "exams": exams_sorted,
        "categories": categories_sorted,
        "branches": branches_sorted,
    }

@api_router.get("/cutoffs/export")
async def export_cutoffs_csv(
    college_id: Optional[str] = None,
    year: Optional[int] = None,
    exam: Optional[str] = None,
    category: Optional[str] = None,
    branch: Optional[str] = None,
    round: Optional[int] = None,
    sort: str = Query("recent")
):
    query: Dict[str, Any] = {}
    if college_id: query["college_id"] = college_id
    if year is not None: query["year"] = year
    if exam: query["exam"] = exam
    if category: query["category"] = category
    if branch: query["branch"] = branch
    if round is not None: query["round"] = round

    sort_spec = [("year", -1), ("round", -1)] if sort == "recent" else [("closing_rank", 1)]
    cursor = db.cutoffs.find(query).sort(sort_spec)
    items = await cursor.to_list(length=None)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","college_id","year","round","exam","category","branch","closing_rank","closing_percentile","created_at"])
    for it in items:
        writer.writerow([
            it.get("id") or str(it.get("_id", "")),
            it.get("college_id",""),
            it.get("year",""),
            it.get("round",""),
            it.get("exam",""),
            it.get("category",""),
            it.get("branch",""),
            it.get("closing_rank",""),
            it.get("closing_percentile",""),
            (it.get("created_at") or "")
        ])

    csv_data = output.getvalue()
    from fastapi import Response
    filename = f"cutoffs_{college_id or 'all'}.csv"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return Response(content=csv_data, media_type="text/csv", headers=headers)

# Seats Routes
@api_router.post("/seats")
async def create_seat(seat: SeatCreate):
    data = seat.dict()
    result = await db.seats.insert_one(data)
    return {"message": "Seat matrix created", "id": str(result.inserted_id)}

@api_router.get("/seats")
async def list_seats(
    college_id: Optional[str] = None,
    year: Optional[int] = None,
    branch: Optional[Union[str, List[str]]] = Query(default=None),
    category: Optional[Union[str, List[str]]] = Query(default=None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    query: Dict[str, Any] = {}
    if college_id: query["college_id"] = college_id
    if year is not None: query["year"] = year
    def to_list(val: Optional[Union[str, List[str]]]):
        if val is None:
            return None
        if isinstance(val, list):
            return val
        if "," in val:
            return [v.strip() for v in val.split(",") if v.strip()]
        return [val]

    branches = to_list(branch)
    cats = to_list(category)
    if branches:
        query["branch"] = {"$in": branches}
    if cats:
        query["category"] = {"$in": cats}

    skip = (page - 1) * limit
    cursor = db.seats.find(query).sort([("year", -1)]).skip(skip).limit(limit)
    items = await cursor.to_list(length=None)
    total = await db.seats.count_documents(query)
    for it in items:
      if "id" not in it:
        it["id"] = str(it.get("_id", ""))
    return {"items": items, "page": page, "limit": limit, "total": total}

@api_router.get("/seats/export")
async def export_seats_csv(
    college_id: Optional[str] = None,
    year: Optional[int] = None,
    branch: Optional[Union[str, List[str]]] = Query(default=None),
    category: Optional[Union[str, List[str]]] = Query(default=None),
):
    query: Dict[str, Any] = {}
    if college_id: query["college_id"] = college_id
    if year is not None: query["year"] = year

    def to_list(val: Optional[Union[str, List[str]]]):
        if val is None:
            return None
        if isinstance(val, list):
            return val
        if isinstance(val, str) and "," in val:
            return [v.strip() for v in val.split(",") if v.strip()]
        return [val] if val else None

    branches = to_list(branch)
    cats = to_list(category)
    if branches:
        query["branch"] = {"$in": branches}
    if cats:
        query["category"] = {"$in": cats}

    cursor = db.seats.find(query).sort([("year", -1)])
    items = await cursor.to_list(length=None)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","college_id","year","branch","category","intake","created_at"])
    for it in items:
        writer.writerow([
            it.get("id") or str(it.get("_id", "")),
            it.get("college_id",""),
            it.get("year",""),
            it.get("branch",""),
            it.get("category",""),
            it.get("intake",""),
            (it.get("created_at") or ""),
        ])
    csv_data = output.getvalue()
    from fastapi import Response
    filename = f"seats_{college_id or 'all'}.csv"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return Response(content=csv_data, media_type="text/csv", headers=headers)

# Reviews Routes
@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate):
    review_dict = review.dict()
    review_dict["created_at"] = datetime.utcnow()
    review_dict["helpful_count"] = 0
    # allow custom id field for consistency
    if "id" not in review_dict:
        review_dict["id"] = str(uuid.uuid4())
    result = await db.reviews.insert_one(review_dict)
    created = await db.reviews.find_one({"_id": result.inserted_id})
    # Convert ObjectId to string id for response
    return ReviewResponse(
        id=str(created.get("id")),
        college_id=created["college_id"],
        user_id=created["user_id"],
        title=created.get("title"),
        body=created.get("body"),
        rating_overall=created["rating_overall"],
        rating_academics=created.get("rating_academics"),
        rating_placements=created.get("rating_placements"),
        rating_infra=created.get("rating_infra"),
        rating_faculty=created.get("rating_faculty"),
        verified=created.get("verified", False),
        helpful_count=created.get("helpful_count", 0),
        created_at=created.get("created_at", datetime.utcnow()),
    )

@api_router.get("/reviews/{college_id}")
async def list_reviews(college_id: str, page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=50), sort: str = Query("recent")):
    skip = (page - 1) * limit
    sort_spec = [("created_at", -1)] if sort == "recent" else [("helpful_count", -1)]
    cursor = db.reviews.find({"college_id": college_id}).sort(sort_spec).skip(skip).limit(limit)
    items = await cursor.to_list(length=None)
    total = await db.reviews.count_documents({"college_id": college_id})
    # Map to client-friendly dicts
    def map_rev(r):
        return {
            "id": r.get("id", str(r.get("_id", ""))),
            "college_id": r["college_id"],
            "user_id": r["user_id"],
            "title": r.get("title"),
            "body": r.get("body"),
            "rating_overall": r.get("rating_overall"),
            "rating_academics": r.get("rating_academics"),
            "rating_placements": r.get("rating_placements"),
            "rating_infra": r.get("rating_infra"),
            "rating_faculty": r.get("rating_faculty"),
            "pros": r.get("pros", []),
            "cons": r.get("cons", []),
            "verified": r.get("verified", False),
            "helpful_count": r.get("helpful_count", 0),
            "created_at": r.get("created_at"),
        }
    return {"reviews": [map_rev(r) for r in items], "page": page, "limit": limit, "total": total}

@api_router.post("/reviews/{review_id}/helpful")
async def mark_review_helpful(review_id: str):
    result = await db.reviews.update_one({"id": review_id}, {"$inc": {"helpful_count": 1}})
    if result.matched_count == 0:
        # fallback to ObjectId matching
        try:
            await db.reviews.update_one({"_id": ObjectId(review_id)}, {"$inc": {"helpful_count": 1}})
        except:
            raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Marked helpful"}

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

# Leads Routes
@api_router.post("/leads")
async def create_lead(lead: Lead):
    data = lead.dict()
    result = await db.leads.insert_one(data)
    # Optional webhook forward
    webhook_url = os.environ.get('LEAD_WEBHOOK_URL')
    if webhook_url:
        try:
            req = urllib.request.Request(webhook_url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=3)  # fire-and-forget best effort
        except Exception as e:
            logger.warning(f"Lead webhook failed: {e}")
    return {"message": "Lead submitted", "id": str(result.inserted_id)}

# Saved Searches Routes
@api_router.post("/saved_searches")
async def create_saved_search(search: SavedSearch):
    data = search.dict()
    result = await db.saved_searches.insert_one(data)
    return {"message": "Saved", "id": str(result.inserted_id)}

@api_router.get("/saved_searches/{user_id}")
async def list_saved_searches(user_id: str):
    items = await db.saved_searches.find({"user_id": user_id}).sort([("created_at", -1)]).to_list(length=None)
    for it in items:
        if "id" not in it:
            it["id"] = str(it.get("_id", ""))
    return {"items": items}

@api_router.patch("/saved_searches/{search_id}")
async def update_saved_search(search_id: str, alerts_enabled: Optional[bool] = None):
    update: Dict[str, Any] = {}
    if alerts_enabled is not None:
        update["alerts_enabled"] = alerts_enabled
    if not update:
        raise HTTPException(status_code=400, detail="No update fields provided")
    await db.saved_searches.update_one({"$or": [{"id": search_id}, {"_id": ObjectId(search_id)}]}, {"$set": update})
    return {"message": "Updated"}

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

# Bulk import colleges (JSON)
@api_router.post("/colleges/bulk")
async def bulk_import_colleges(payload: Dict[str, Any]):
    """Import a list of colleges. Missing fields are filled with sensible defaults.
    Body format: {"colleges": [ { name, city, state, ... }, ... ]}
    """
    items = payload.get("colleges", [])
    if not isinstance(items, list) or not items:
        raise HTTPException(status_code=400, detail="'colleges' must be a non-empty list")

    docs = []
    for raw in items:
        if not isinstance(raw, dict):
            continue
        # minimal required provided
        if not raw.get("name") or not raw.get("city") or not raw.get("state"):
            continue
        docs.append(_fill_defaults_for_college(raw))

    if not docs:
        raise HTTPException(status_code=400, detail="No valid college items to insert")

    # Dedupe by (name, city, state)
    to_insert = []
    for d in docs:
        exists = await db.colleges.count_documents({"name": d["name"], "city": d["city"], "state": d["state"]})
        if exists == 0:
            to_insert.append(d)

    if not to_insert:
        return {"inserted": 0, "skipped": len(docs)}

    result = await db.colleges.insert_many(to_insert)
    return {"inserted": len(result.inserted_ids), "skipped": len(docs) - len(to_insert)}

# Recommendation Routes
@api_router.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized college recommendations based on user preferences and browsing history"""
    try:
        # Get all colleges from database
        colleges_cursor = db.colleges.find({})
        colleges = await colleges_cursor.to_list(length=None)
        
        if not colleges:
            return {"recommendations": [], "message": "No colleges found in database"}
        
        # Convert to dict format for recommendation engine
        colleges_dict = [college_helper(college) for college in colleges]
        
        # Convert preferences to dict
        preferences_dict = request.preferences.dict()
        
        # Convert browsing history to dict
        browsing_history_dict = [item.dict() for item in request.browsing_history]
        
        # Get recommendations
        recommendations = recommendation_engine.calculate_recommendations(
            colleges_dict, 
            preferences_dict, 
            browsing_history_dict
        )
        
        # Limit results
        limited_recommendations = recommendations[:request.limit]
        
        return {
            "recommendations": limited_recommendations,
            "total_found": len(recommendations),
            "user_id": request.user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@api_router.get("/recommendations/trending")
async def get_trending_colleges(limit: int = Query(10, ge=1, le=50)):
    """Get trending colleges based on overall popularity and ratings"""
    try:
        # Get all colleges from database
        colleges_cursor = db.colleges.find({})
        colleges = await colleges_cursor.to_list(length=None)
        
        if not colleges:
            return {"trending": [], "message": "No colleges found in database"}
        
        # Convert to dict format
        colleges_dict = [college_helper(college) for college in colleges]
        
        # Get trending colleges (fallback to top-rated if no browsing history)
        trending = recommendation_engine.get_trending_colleges(colleges_dict, [])
        
        return {
            "trending": trending[:limit],
            "total_found": len(trending)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trending colleges: {str(e)}")

@api_router.post("/recommendations/quick")
async def get_quick_recommendations(
    preferred_courses: List[str] = Query(..., description="Preferred courses"),
    budget_max: int = Query(500000, description="Maximum budget"),
    preferred_state: Optional[str] = Query(None, description="Preferred state"),
    limit: int = Query(5, ge=1, le=20)
):
    """Get quick recommendations based on basic preferences"""
    try:
        # Build basic filter query
        filter_query = {}
        
        # Course filter
        if preferred_courses:
            filter_query["courses_offered"] = {
                "$in": [re.compile(course, re.IGNORECASE) for course in preferred_courses]
            }
        
        # Budget filter
        filter_query["annual_fees"] = {"$lte": budget_max}
        
        # State filter
        if preferred_state:
            filter_query["state"] = {"$regex": preferred_state, "$options": "i"}
        
        # Get colleges matching basic criteria
        colleges_cursor = db.colleges.find(filter_query).sort("star_rating", -1).limit(limit)
        colleges = await colleges_cursor.to_list(length=None)
        
        # Convert to response format
        college_responses = [CollegeResponse(**college_helper(college)) for college in colleges]
        
        return {
            "quick_recommendations": college_responses,
            "criteria": {
                "courses": preferred_courses,
                "max_budget": budget_max,
                "state": preferred_state
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting quick recommendations: {str(e)}")

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
            "address": "Hauz Khas, New Delhi - 110016",
            "course_fees": [
                {"program": "B.Tech CSE", "duration": "4 years", "fees": 250000, "eligibility": "JEE Advanced"},
                {"program": "B.Tech EE", "duration": "4 years", "fees": 240000, "eligibility": "JEE Advanced"}
            ],
            "placement_stats": [
                {"year": 2023, "avg_package": 1500000, "median_package": 1350000, "placement_percentage": 95.0},
                {"year": 2022, "avg_package": 1400000, "median_package": 1250000, "placement_percentage": 94.0}
            ],
            "recruiters": ["Google", "Microsoft", "Amazon", "Flipkart"],
            "gallery_urls": [
                "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200",
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200"
            ]
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

@api_router.post("/dev/seed-colleges")
async def seed_more_colleges(
    count: int = Query(100, ge=1, le=1000),
    with_cutoffs: bool = Query(False, description="Also seed cutoffs for generated colleges")
):
    """Insert synthetic colleges covering multiple branches/states for testing filters."""
    states = [
        ("Maharashtra", ["Mumbai", "Pune", "Nagpur", "Nashik"]),
        ("Karnataka", ["Bengaluru", "Mysuru", "Mangaluru"]),
        ("Tamil Nadu", ["Chennai", "Coimbatore", "Madurai"]),
        ("Telangana", ["Hyderabad", "Warangal"]),
        ("West Bengal", ["Kolkata", "Durgapur"]),
        ("Delhi", ["New Delhi"]),
        ("Uttar Pradesh", ["Lucknow", "Noida", "Kanpur"]),
        ("Gujarat", ["Ahmedabad", "Surat", "Vadodara"]),
        ("Rajasthan", ["Jaipur", "Jodhpur"]),
        ("Kerala", ["Kochi", "Trivandrum"]),
    ]
    branches = [
        "Computer Science", "Information Technology", "Electronics",
        "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
        "Chemical Engineering", "Biotechnology", "Aerospace Engineering",
        "Data Science", "Artificial Intelligence"
    ]
    accreditations = [
        ["NAAC A++", "NBA", "AICTE"],
        ["NAAC A+", "AICTE"],
        ["NAAC A", "NBA"],
    ]
    types = ["Government", "Private", "Deemed"]

    def pick(lst):
        return random.choice(lst)

    docs = []
    for i in range(count):
        state, cities = pick(states)
        city = pick(cities)
        uni_type = pick(types)
        rating = round(random.uniform(3.0, 5.0), 1)
        fees = random.randint(80000, 450000)
        rank = random.randint(1, 300)
        placement = round(random.uniform(50.0, 98.0), 1)
        avg_pkg = random.randint(400000, 2000000)
        high_pkg = avg_pkg * random.randint(3, 8)
        established = random.randint(1950, 2018)
        total_students = random.randint(1500, 50000)
        faculty = max(80, int(total_students * random.uniform(0.02, 0.06)))
        offered = random.sample(branches, k=random.randint(4, min(7, len(branches))))

        name = f"{city} Institute of Technology & Sciences {random.randint(100,999)}"
        docs.append({
            "name": name,
            "city": city,
            "state": state,
            "country": "India",
            "ranking": rank,
            "star_rating": rating,
            "annual_fees": fees,
            "courses_offered": offered,
            "established_year": established,
            "university_type": uni_type,
            "accreditation": pick(accreditations),
            "campus_size": f"{random.randint(30, 400)} acres",
            "total_students": total_students,
            "faculty_count": faculty,
            "placement_percentage": placement,
            "average_package": avg_pkg,
            "highest_package": high_pkg,
            "hostel_facilities": random.choice([True, True, False]),
            "library_facilities": True,
            "sports_facilities": random.choice([True, True, False]),
            "wifi": True,
            "canteen": True,
            "medical_facilities": random.choice([True, False]),
            "description": "Synthetic college generated for testing filters and UI.",
            "admission_process": pick(["JEE Main", "State CET", "Management Quota", "Institutional Exam"]),
            "contact_email": f"info@{city.lower().replace(' ','')}.edu",
            "contact_phone": f"+91-{random.randint(100,999)}-{random.randint(1000000,9999999)}",
            "website": f"https://{city.lower().replace(' ','')}{random.randint(100,999)}.edu",
            "address": f"{random.randint(1,200)}, {city}, {state}",
        })

    if not docs:
        return {"inserted": 0}

    result = await db.colleges.insert_many(docs)

    seeded_cutoffs = 0
    if with_cutoffs:
        exams = ["JEE Main", "KCET", "MHT-CET", "WBJEE", "COMEDK"]
        categories = ["GEN", "EWS", "OBC", "SC", "ST"]
        cutoff_docs = []
        # Fetch inserted documents' ids
        ids = result.inserted_ids
        # For each college, create a few cutoff entries across years/branches
        years = [datetime.utcnow().year - d for d in range(0, 3)]
        for _id, doc in zip(ids, docs):
            cid = str(_id)
            for y in years:
                for branch in random.sample(doc["courses_offered"], k=min(3, len(doc["courses_offered"]))):
                    exam = pick(exams)
                    cat = pick(categories)
                    closing_rank = random.randint(500, 200000)
                    cutoff_docs.append({
                        "college_id": cid,
                        "year": y,
                        "round": random.randint(1, 3),
                        "exam": exam,
                        "category": cat,
                        "branch": branch,
                        "closing_rank": closing_rank,
                        "closing_percentile": None,
                        "created_at": datetime.utcnow(),
                    })
        if cutoff_docs:
            await db.cutoffs.insert_many(cutoff_docs)
            seeded_cutoffs = len(cutoff_docs)

    return {"inserted": len(result.inserted_ids), "cutoffs": seeded_cutoffs}

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
