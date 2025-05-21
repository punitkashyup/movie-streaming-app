# Initialize the models package
# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.movie import Movie
from app.models.subscription import SubscriptionPlan, Subscription
