import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/users", tags=["Users & Trusted Contacts"])


@router.get("/demo", response_model=dict, summary="Get pre-seeded demo user and trusted contacts")
def get_demo_user(db: Session = Depends(get_db)):
    """
    Returns the primary pre-seeded demo user ('Sreeya') along with her pre-configured
    trusted contacts. Allows the frontend mobile PWA and guardian dashboards to boot
    and operate immediately with zero friction without requiring a login flow.
    """
    user = db.query(models.User).filter(models.User.name == "Sreeya").first()
    if not user:
        # Fallback to the first available user in DB
        user = db.query(models.User).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo user not found. Database seeding may not have completed."
        )

    contacts = db.query(models.TrustedContact).filter(models.TrustedContact.user_id == user.id).all()

    return {
        "user": schemas.UserResponse.model_validate(user),
        "contacts": [schemas.TrustedContactResponse.model_validate(c) for c in contacts]
    }


@router.get("/{user_id}", response_model=schemas.UserResponse, summary="Get user details by ID")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, summary="Create a new user")
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    user = models.User(
        id=str(uuid.uuid4()),
        name=payload.name,
        phone=payload.phone,
        email=payload.email
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}/contacts", response_model=List[schemas.TrustedContactResponse], summary="List trusted contacts for a user")
def list_trusted_contacts(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.contacts


@router.post("/{user_id}/contacts", response_model=schemas.TrustedContactResponse, status_code=status.HTTP_201_CREATED, summary="Add a trusted contact")
def add_trusted_contact(user_id: str, payload: schemas.TrustedContactCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # If new contact is primary SOS, unset other primary contacts
    if payload.is_primary_sos:
        db.query(models.TrustedContact).filter(
            models.TrustedContact.user_id == user_id,
            models.TrustedContact.is_primary_sos == True
        ).update({"is_primary_sos": False})

    contact = models.TrustedContact(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=payload.name,
        relationship_role=payload.relationship_role,
        phone=payload.phone,
        telegram_chat_id=payload.telegram_chat_id,
        is_primary_sos=payload.is_primary_sos
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact
