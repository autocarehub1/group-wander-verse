#!/usr/bin/env python3

"""
Load Generator for WanderTogether Travel Application
Simulates realistic user behavior for travel planning scenarios
"""

import random
import json
from locust import HttpUser, task, between
from faker import Faker

fake = Faker()

class TravelAppUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Initialize user session"""
        self.user_id = None
        self.trip_id = None
        self.create_user()
    
    def create_user(self):
        """Create a new user account"""
        user_data = {
            "email": fake.email(),
            "firstName": fake.first_name(),
            "lastName": fake.last_name(),
            "dietaryRestrictions": random.choice(["none", "vegetarian", "vegan", "gluten-free"]),
            "accessibilityNeeds": random.choice(["none", "wheelchair", "mobility-aid"]),
            "emergencyContact": {
                "name": fake.name(),
                "phone": fake.phone_number(),
                "relationship": random.choice(["spouse", "parent", "sibling", "friend"])
            }
        }
        
        with self.client.post("/api/users", 
                            json=user_data,
                            catch_response=True) as response:
            if response.status_code == 201:
                self.user_id = response.json()["id"]
                response.success()
            elif response.status_code == 400 and "duplicate" in response.text:
                # User already exists, try to get existing user
                response.success()
                self.user_id = fake.uuid4()
            else:
                response.failure(f"Failed to create user: {response.status_code}")

    @task(3)
    def browse_homepage(self):
        """Browse the homepage"""
        self.client.get("/", name="Homepage")

    @task(2)
    def create_trip(self):
        """Create a new trip"""
        if not self.user_id:
            return
            
        trip_data = {
            "title": f"Trip to {fake.city()}",
            "destination": fake.city(),
            "startDate": fake.date_between(start_date="+1d", end_date="+30d").isoformat(),
            "endDate": fake.date_between(start_date="+31d", end_date="+60d").isoformat(),
            "budget": random.randint(1000, 5000),
            "description": fake.text(max_nb_chars=200)
        }
        
        with self.client.post(f"/api/users/{self.user_id}/trips",
                            json=trip_data,
                            catch_response=True) as response:
            if response.status_code == 201:
                self.trip_id = response.json()["id"]
                response.success()
            else:
                response.failure(f"Failed to create trip: {response.status_code}")

    @task(2)
    def view_trips(self):
        """View user's trips"""
        if not self.user_id:
            return
            
        self.client.get(f"/api/users/{self.user_id}/trips", name="View Trips")

    @task(1)
    def view_trip_details(self):
        """View specific trip details"""
        if not self.trip_id:
            return
            
        self.client.get(f"/api/trips/{self.trip_id}", name="Trip Details")

    @task(2)
    def view_activities(self):
        """View trip activities"""
        if not self.trip_id:
            return
            
        self.client.get(f"/api/trips/{self.trip_id}/activities", name="Trip Activities")

    @task(1)
    def vote_on_activity(self):
        """Vote on trip activities"""
        if not self.trip_id:
            return
            
        # First get activities to vote on
        response = self.client.get(f"/api/trips/{self.trip_id}/activities")
        if response.status_code == 200:
            activities = response.json()
            if activities:
                activity = random.choice(activities)
                activity_id = activity["id"]
                
                # Vote on the activity
                vote_data = {
                    "status": random.choice(["interested", "not_interested", "maybe"])
                }
                
                self.client.patch(f"/api/activities/{activity_id}",
                                json=vote_data,
                                name="Vote on Activity")

    @task(1)
    def add_expense(self):
        """Add a trip expense"""
        if not self.trip_id:
            return
            
        expense_data = {
            "description": random.choice([
                "Hotel accommodation",
                "Flight tickets", 
                "Restaurant dinner",
                "Transportation",
                "Activities and tours",
                "Shopping",
                "Gas and parking"
            ]),
            "amount": round(random.uniform(20, 500), 2),
            "category": random.choice(["accommodation", "transportation", "food", "activities", "other"]),
            "date": fake.date_between(start_date="-7d", end_date="+7d").isoformat(),
            "paidBy": self.user_id,
            "splitBetween": [self.user_id]  # Simplified for load testing
        }
        
        self.client.post(f"/api/trips/{self.trip_id}/expenses",
                        json=expense_data,
                        name="Add Expense")

    @task(1)
    def view_expenses(self):
        """View trip expenses"""
        if not self.trip_id:
            return
            
        self.client.get(f"/api/trips/{self.trip_id}/expenses", name="View Expenses")

    @task(1)
    def send_message(self):
        """Send a group message"""
        if not self.trip_id:
            return
            
        message_data = {
            "content": fake.sentence(),
            "type": "text"
        }
        
        self.client.post(f"/api/trips/{self.trip_id}/messages",
                        json=message_data,
                        name="Send Message")

    @task(1)
    def view_messages(self):
        """View group messages"""
        if not self.trip_id:
            return
            
        self.client.get(f"/api/trips/{self.trip_id}/messages", name="View Messages")

    @task(1)
    def health_check(self):
        """Check application health"""
        self.client.get("/health", name="Health Check")


class AdminUser(HttpUser):
    """Simulates admin/power user behavior with higher load"""
    wait_time = between(0.5, 2)
    weight = 1  # Lower weight than regular users
    
    @task
    def stress_test_endpoints(self):
        """Stress test critical endpoints"""
        endpoints = [
            "/health",
            "/api/users",
            "/api/trips"
        ]
        
        endpoint = random.choice(endpoints)
        self.client.get(endpoint, name=f"Stress Test {endpoint}")


# Environment configuration
class WebsiteUser(HttpUser):
    """Basic website visitor behavior"""
    wait_time = between(2, 5)
    weight = 3  # Higher weight for regular users
    
    tasks = [TravelAppUser]