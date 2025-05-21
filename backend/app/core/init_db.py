import logging
from sqlalchemy.orm import Session

from app.core.database import Base, engine, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.movie import Movie

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample movie data
MOVIES = [
    {
        "title": "The Shawshank Redemption",
        "description": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        "release_year": 1994,
        "duration": 142,
        "genre": "Drama",
        "director": "Frank Darabont",
        "cast": "Tim Robbins, Morgan Freeman, Bob Gunton",
        "poster_url": "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        "video_url": "https://example.com/videos/shawshank-redemption.mp4",
        "rating": 9.3
    },
    {
        "title": "The Godfather",
        "description": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        "release_year": 1972,
        "duration": 175,
        "genre": "Crime, Drama",
        "director": "Francis Ford Coppola",
        "cast": "Marlon Brando, Al Pacino, James Caan",
        "poster_url": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
        "video_url": "https://example.com/videos/godfather.mp4",
        "rating": 9.2
    },
    {
        "title": "The Dark Knight",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "release_year": 2008,
        "duration": 152,
        "genre": "Action, Crime, Drama",
        "director": "Christopher Nolan",
        "cast": "Christian Bale, Heath Ledger, Aaron Eckhart",
        "poster_url": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
        "video_url": "https://example.com/videos/dark-knight.mp4",
        "rating": 9.0
    },
    {
        "title": "Pulp Fiction",
        "description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        "release_year": 1994,
        "duration": 154,
        "genre": "Crime, Drama",
        "director": "Quentin Tarantino",
        "cast": "John Travolta, Uma Thurman, Samuel L. Jackson",
        "poster_url": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
        "video_url": "https://example.com/videos/pulp-fiction.mp4",
        "rating": 8.9
    },
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        "release_year": 2010,
        "duration": 148,
        "genre": "Action, Adventure, Sci-Fi",
        "director": "Christopher Nolan",
        "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
        "poster_url": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
        "video_url": "https://example.com/videos/inception.mp4",
        "rating": 8.8
    },
    {
        "title": "The Matrix",
        "description": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        "release_year": 1999,
        "duration": 136,
        "genre": "Action, Sci-Fi",
        "director": "Lana Wachowski, Lilly Wachowski",
        "cast": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
        "poster_url": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
        "video_url": "https://example.com/videos/matrix.mp4",
        "rating": 8.7
    }
]

def init_db(db: Session) -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have users
    user = db.query(User).first()
    if user:
        logger.info("Database already initialized, skipping")
        return
    
    # Create admin user
    admin_user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=get_password_hash("adminpassword"),
        is_active=True,
        is_superuser=True
    )
    db.add(admin_user)
    
    # Create regular user
    regular_user = User(
        email="user@example.com",
        username="user",
        hashed_password=get_password_hash("userpassword"),
        is_active=True,
        is_superuser=False
    )
    db.add(regular_user)
    
    # Add sample movies
    for movie_data in MOVIES:
        movie = Movie(**movie_data)
        db.add(movie)
    
    db.commit()
    logger.info("Database initialized with sample data")

def main() -> None:
    logger.info("Creating initial data")
    db = next(get_db())
    init_db(db)
    logger.info("Initial data created")

if __name__ == "__main__":
    main()
