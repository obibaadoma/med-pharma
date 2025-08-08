# Medpharma Queue Management System

## Overview
This app is realtime queue management solution for medical consultations that provides patients with visibility into their position in queue, estimated waiting time, doctor status, and turn notifications.

## Technical Write-up

### What the Queue Management System Does
The Medpharma Queue Management System provides real-time visibility into medical consultation, solving the core problems patients face when waiting for online appointments:

- **Queue Position Tracking**: Patients can see exactly where they are in the consultation queue
- **Dynamic Wait Time Estimation**: Real-time calculation of estimated waiting time based on doctor's average consultation duration
- **Doctor Status Monitoring**: Visibility into whether doctors are on schedule or running late
- **Turn Notifications**: Automatic alerts when it's the patient's turn to join the consultation

### How It Works

#### System Flow
1. **Patient Booking**: Patients book consultations through the web interface, selecting their preferred doctor
2. **Queue Placement**: The system places patients in a virtual queue based on booking time
3. **Real-time Connection**: WebSocket connection establishes live communication between frontend and backend
4. **Position Calculation**: Backend continuously calculates queue positions and estimated wait times
5. **Live Updates**: Real-time updates are pushed to patients via WebSocket
6. **Turn Notification**: System automatically alerts patients when their consultation is about to begin

#### Data Flow
```
Patient Booking → Queue Placement → WebSocket Connection → 
Real-time Calculations → Live UI Updates → Turn Notification
```

#### Real-time Mechanism
- **WebSocket Protocol**: Persistent connection for instant updates
- **Event-driven Architecture**: Subscribe to queue updates for specific appointments
- **Push-based Updates**: Server pushes changes rather than client polling

### Tech Stack and Architecture Choices

#### Backend (NestJS)
- **Framework**: NestJS with TypeScript for structured, maintainable code
- **Real-time**: Socket.IO WebSocket implementation for live updates
- **API**: RESTful endpoints with Swagger documentation
- **Architecture**: Modular service-based design with clear separation of concerns

#### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router for modern React development
- **Language**: TypeScript for type safety and reduced runtime errors
- **Styling**: Tailwind CSS for responsive, utility-first design
- **Real-time**: Socket.IO client for WebSocket communication

#### Architecture Pattern
```
┌─────────────────┐    HTTP/REST     ┌──────────────────┐
│   Frontend      │ ◀─────────────▶  │    Backend       │
│  (Next.js)      │                  │   (NestJS)       │
│                 │ ◀─WebSocket──▶   │                  │
└─────────────────┘    Events        └──────────────────┘
```

#### Key Design Decisions
- **WebSocket over Polling**: Chosen for lower latency and better user experience
- **In-memory Storage**: Used for simplicity (can be extended to databases)
- **Service-oriented Backend**: Modular design for maintainability
- **Mobile-first Frontend**: Responsive design for all devices

### Trade-offs and Assumptions

#### Assumptions
1. **Doctor Availability**: Doctors follow scheduled appointment times reasonably
2. **Consultation Duration**: Average consultation time remains relatively consistent per doctor
3. **Internet Connectivity**: Patients have stable internet connection for real-time updates
4. **Queue Discipline**: First-come, first-served queuing principle is followed
5. **User Behavior**: Patients will stay connected to receive real-time updates

#### Trade-offs
1. **Simplicity vs. Completeness**: Focused on core queue visibility rather than complex scheduling features
2. **Real-time vs. Performance**: Prioritized user experience with real-time updates over server resource optimization
3. **Web vs. Mobile**: Chose web implementation (acceptable per requirements) over native mobile app
4. **In-memory vs. Database**: Used in-memory storage for rapid development (production would use persistent storage)
5. **Feature Scope**: Limited to queue management rather than full appointment scheduling system

#### Limitations
- **No Authentication**: System doesn't include user authentication or authorization
- **Basic Queue Logic**: Simple first-in-first-out queuing without priority levels
- **Single Server**: Not designed for horizontal scaling (would require Redis for multi-server setup)
- **No Persistence**: Data is lost when server restarts (in-memory storage)

#### Future Considerations
- **Database Integration**: PostgreSQL or MongoDB for persistent storage
- **Authentication**: User login and role-based access control
- **Admin Dashboard**: Doctor and administrator interfaces
- **Mobile App**: React Native or Flutter implementation
- **Advanced Features**: Cancellation, rescheduling, and priority queuing

## API Documentation

### REST API Endpoints

POST /appointments
- Create new appointment
- Request: { patientName: string, doctorId: string }
- Response: Appointment object

GET /appointments/{id}
- Get appointment details
- Response: Appointment object with position and wait time

GET /appointments
- Get all appointments
- Response: Array of Appointment objects

PUT /appointments/{id}/status
- Update appointment status
- Request: { status: string }
- Response: { success: boolean }

GET /doctors
- Get all doctors
- Response: Array of Doctor objects

GET /doctors/{id}
- Get specific doctor details
- Response: Doctor object

GET /doctors/{id}/queue
- Get current queue for specific doctor
- Response: { queue: Appointment[] }


### WebSocket Events

Client → Server:
- subscribeToQueue: { appointmentId: string }

Server → Client:
- queue:update: { position: number, estimatedWaitTime: number }
- appointment:turn: { message: string }


## Setup Instructions

### Prerequisites
- Node.js 16+
- npm or yarn

### Backend Setup
bash
cd medpharma-backend
npm install
npm run start

Backend runs on `http://localhost:3000`

### Frontend Setup
bash
cd medpharma-frontend
npm install
npm run dev -- -p 3001

Frontend runs on `http://localhost:3001`

### API Documentation
Visit `http://localhost:3000/api` for Swagger documentation

## Project Structure

### Backend

src/
├── appointments/   # Appointment management
├── doctors/        # Doctor status tracking
├── queue/          # Queue logic and position calculation
├── websocket/      # Real-time communication
└── main.ts         # Application entry point


### Frontend

src/
├── app/            # Next.js app router pages
│   ├── queue/[id]/ # Dynamic queue status page
│   └── page.tsx    # Booking page
├── lib/            # Utility services and types
└── app/globals.css # Global styles


## Bonus Features

### 1. Notification System
- Real-time turn notifications via WebSocket
- Visual alerts with auto-dismiss
- Browser console logging

### 2. Queue Management
- Appointment status tracking (waiting, in-progress, completed, cancelled)
- Automatic queue reordering
- Position visualization

### 3. Doctor Integration
- Multiple doctor support
- Specialty information display
- Average consultation time tracking
 
### 4. Queue Cancellation Support
- **REST API Endpoint**: `DELETE /appointments/{id}` for appointment cancellation
- **Real-time Queue Updates**: Automatic repositioning when appointments are cancelled
- **UI Integration**: Cancel button on queue status page with confirmation dialog
- **Status Management**: Proper handling of 'cancelled' appointment status

## Evaluation Criteria Addressed

### Problem Solving
✅ Addresses all 4 core issues: position, wait time, doctor status, turn notifications

### Code Quality
✅ Well-structured TypeScript code with modular architecture
✅ Clear separation of concerns
✅ Type safety throughout

### Real-time Experience
✅ WebSocket implementation for live updates
✅ Smooth UI transitions and feedback
✅ Responsive design

### UX Thinking
✅ Intuitive booking flow
✅ Clear visual hierarchy
✅ Progress indicators
✅ Meaningful notifications

### Technical Communication
✅ Clear architecture documentation
✅ API endpoint specification
✅ Technical decision explanations

## Submission Notes

This solution provides a complete, working implementation of the Medpharma queue management system with both backend and frontend components. The real-time features are fully functional, and the user experience addresses all the core problems identified in the assignment.

The system can be easily extended with additional features and integrated with more robust data storage solutions for production use.

The Fast Refresh warning that may occur during development (as explained in the Next.js documentation) happens when files have multiple exports besides React components, use anonymous functions, or have component names in camelCase instead of PascalCase. This is a development-time feature and doesn't affect the production functionality of the application.