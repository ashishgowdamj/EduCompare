import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import math

class RecommendationEngine:
    def __init__(self):
        self.weights = {
            'course_match': 0.25,
            'location_match': 0.20,
            'budget_match': 0.20,
            'rating_match': 0.15,
            'placement_match': 0.10,
            'browsing_history': 0.10
        }
    
    def calculate_recommendations(
        self, 
        colleges: List[Dict], 
        preferences: Dict[str, Any], 
        browsing_history: List[Dict] = None
    ) -> List[Dict]:
        """
        Calculate personalized college recommendations based on user preferences and browsing history
        """
        if not colleges:
            return []
        
        scored_colleges = []
        
        for college in colleges:
            score = self._calculate_college_score(college, preferences, browsing_history)
            college_with_score = {
                **college,
                'recommendation_score': score,
                'match_reasons': self._get_match_reasons(college, preferences)
            }
            scored_colleges.append(college_with_score)
        
        # Sort by recommendation score (highest first)
        scored_colleges.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return scored_colleges
    
    def _calculate_college_score(
        self, 
        college: Dict, 
        preferences: Dict[str, Any], 
        browsing_history: List[Dict] = None
    ) -> float:
        """
        Calculate a comprehensive score for a college based on user preferences
        """
        scores = {}
        
        # Course matching score
        scores['course_match'] = self._calculate_course_match(college, preferences)
        
        # Location matching score
        scores['location_match'] = self._calculate_location_match(college, preferences)
        
        # Budget matching score
        scores['budget_match'] = self._calculate_budget_match(college, preferences)
        
        # Rating matching score
        scores['rating_match'] = self._calculate_rating_match(college, preferences)
        
        # Placement matching score
        scores['placement_match'] = self._calculate_placement_match(college, preferences)
        
        # Browsing history score
        scores['browsing_history'] = self._calculate_browsing_history_score(college, browsing_history)
        
        # Calculate weighted total score
        total_score = sum(
            scores[factor] * self.weights[factor] 
            for factor in scores
        )
        
        return min(total_score, 1.0)  # Cap at 1.0
    
    def _calculate_course_match(self, college: Dict, preferences: Dict) -> float:
        """Calculate how well college courses match user preferences"""
        preferred_courses = preferences.get('preferredCourses', [])
        if not preferred_courses:
            return 0.5  # Neutral score if no preferences
        
        college_courses = college.get('courses_offered', [])
        if not college_courses:
            return 0.0
        
        # Convert to lowercase for comparison
        preferred_lower = [course.lower() for course in preferred_courses]
        college_lower = [course.lower() for course in college_courses]
        
        # Calculate overlap
        matches = sum(1 for course in preferred_lower if any(pref in course for pref in college_lower))
        
        return min(matches / len(preferred_courses), 1.0)
    
    def _calculate_location_match(self, college: Dict, preferences: Dict) -> float:
        """Calculate location preference match"""
        preferred_states = preferences.get('preferredStates', [])
        preferred_cities = preferences.get('preferredCities', [])
        
        if not preferred_states and not preferred_cities:
            return 0.5  # Neutral if no location preference
        
        college_state = college.get('state', '').lower()
        college_city = college.get('city', '').lower()
        
        score = 0.0
        
        # State match (higher weight)
        if preferred_states:
            state_match = any(state.lower() in college_state for state in preferred_states)
            score += 0.7 if state_match else 0.0
        
        # City match (additional bonus)
        if preferred_cities:
            city_match = any(city.lower() in college_city for city in preferred_cities)
            score += 0.3 if city_match else 0.0
        
        return min(score, 1.0)
    
    def _calculate_budget_match(self, college: Dict, preferences: Dict) -> float:
        """Calculate budget compatibility"""
        budget_range = preferences.get('budgetRange', {})
        min_budget = budget_range.get('min', 0)
        max_budget = budget_range.get('max', float('inf'))
        
        college_fees = college.get('annual_fees', 0)
        
        if college_fees == 0:
            return 0.5  # Neutral if fees not specified
        
        if min_budget <= college_fees <= max_budget:
            # Perfect match - within budget
            return 1.0
        elif college_fees < min_budget:
            # Below minimum - still good but maybe too cheap
            return 0.8
        else:
            # Above maximum - penalize based on how much over
            overage_ratio = (college_fees - max_budget) / max_budget
            return max(0.0, 1.0 - overage_ratio)
    
    def _calculate_rating_match(self, college: Dict, preferences: Dict) -> float:
        """Calculate rating preference match"""
        min_rating = preferences.get('minRating', 0)
        college_rating = college.get('star_rating', 0)
        
        if min_rating == 0:
            return 0.5  # Neutral if no minimum rating specified
        
        if college_rating >= min_rating:
            # Bonus for exceeding minimum rating
            bonus = (college_rating - min_rating) / (5 - min_rating) if min_rating < 5 else 0
            return min(1.0, 0.8 + bonus * 0.2)
        else:
            # Penalty for not meeting minimum
            penalty = (min_rating - college_rating) / min_rating
            return max(0.0, 1.0 - penalty)
    
    def _calculate_placement_match(self, college: Dict, preferences: Dict) -> float:
        """Calculate placement priority match"""
        placement_priority = preferences.get('placementPriority', 3)
        
        if placement_priority <= 2:
            return 0.5  # Low priority - neutral score
        
        placement_percentage = college.get('placement_percentage', 0)
        average_package = college.get('average_package', 0)
        
        # Normalize placement percentage (0-100 to 0-1)
        placement_score = placement_percentage / 100.0
        
        # Normalize package (assume max reasonable package is 50L)
        package_score = min(average_package / 5000000, 1.0) if average_package > 0 else 0
        
        # Weight based on user priority
        priority_weight = (placement_priority - 2) / 3.0  # Scale 3-5 to 0.33-1.0
        
        combined_score = (placement_score * 0.6 + package_score * 0.4) * priority_weight
        
        return combined_score
    
    def _calculate_browsing_history_score(self, college: Dict, browsing_history: List[Dict]) -> float:
        """Calculate score based on browsing history patterns"""
        if not browsing_history:
            return 0.0
        
        college_id = college.get('id')
        score = 0.0
        
        # Recent activity bonus
        now = datetime.now().timestamp() * 1000  # Convert to milliseconds
        week_ago = now - (7 * 24 * 60 * 60 * 1000)
        
        for item in browsing_history:
            if item.get('timestamp', 0) < week_ago:
                continue  # Skip old history
            
            # Direct interaction with this college
            if item.get('collegeId') == college_id:
                action = item.get('action', '')
                if action == 'favorite':
                    score += 0.3
                elif action == 'compare':
                    score += 0.2
                elif action == 'view':
                    duration = item.get('duration', 0)
                    # Longer viewing time = more interest
                    score += min(duration / 300, 0.1)  # Max 0.1 for 5+ minutes
        
        return min(score, 1.0)
    
    def _get_match_reasons(self, college: Dict, preferences: Dict) -> List[str]:
        """Generate human-readable reasons why this college matches user preferences"""
        reasons = []
        
        # Course match
        preferred_courses = preferences.get('preferredCourses', [])
        college_courses = college.get('courses_offered', [])
        if preferred_courses and college_courses:
            matching_courses = []
            for pref in preferred_courses:
                for course in college_courses:
                    if pref.lower() in course.lower():
                        matching_courses.append(course)
                        break
            if matching_courses:
                reasons.append(f"Offers {', '.join(matching_courses[:2])}")
        
        # Location match
        preferred_states = preferences.get('preferredStates', [])
        college_state = college.get('state', '')
        if any(state.lower() in college_state.lower() for state in preferred_states):
            reasons.append(f"Located in {college_state}")
        
        # Budget match
        budget_range = preferences.get('budgetRange', {})
        max_budget = budget_range.get('max', float('inf'))
        college_fees = college.get('annual_fees', 0)
        if college_fees <= max_budget:
            reasons.append("Within your budget")
        
        # Rating match
        min_rating = preferences.get('minRating', 0)
        college_rating = college.get('star_rating', 0)
        if college_rating >= min_rating and college_rating >= 4.0:
            reasons.append(f"High rated ({college_rating:.1f}★)")
        
        # Placement match
        placement_priority = preferences.get('placementPriority', 3)
        if placement_priority >= 4:
            placement_percentage = college.get('placement_percentage', 0)
            if placement_percentage >= 80:
                reasons.append(f"Excellent placements ({placement_percentage}%)")
        
        return reasons[:3]  # Return top 3 reasons
    
    def get_trending_colleges(self, colleges: List[Dict], browsing_history: List[Dict] = None) -> List[Dict]:
        """Get trending colleges based on recent browsing patterns"""
        if not browsing_history:
            # Fallback to top-rated colleges
            return sorted(colleges, key=lambda x: x.get('star_rating', 0), reverse=True)[:10]
        
        # Count recent interactions
        now = datetime.now().timestamp() * 1000
        week_ago = now - (7 * 24 * 60 * 60 * 1000)
        
        college_interactions = {}
        for item in browsing_history:
            if item.get('timestamp', 0) < week_ago:
                continue
            
            college_id = item.get('collegeId')
            if college_id:
                college_interactions[college_id] = college_interactions.get(college_id, 0) + 1
        
        # Score colleges based on interactions and ratings
        scored_colleges = []
        for college in colleges:
            interaction_count = college_interactions.get(college.get('id'), 0)
            rating = college.get('star_rating', 0)
            
            # Combine interaction count and rating
            trend_score = (interaction_count * 0.7) + (rating * 0.3)
            
            scored_colleges.append({
                **college,
                'trend_score': trend_score
            })
        
        return sorted(scored_colleges, key=lambda x: x['trend_score'], reverse=True)[:10]
