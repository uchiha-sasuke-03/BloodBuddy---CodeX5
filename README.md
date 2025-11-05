# BloodBuddy - Emergency Blood Donor Connection Platform

BloodBuddy is a real-time web application that connects blood donors with people in need during medical emergencies. The platform uses location-based matching to find compatible blood donors nearby and facilitates immediate phone contact.

## Features

- **Quick Authentication**
  - Phone number-based signup/login
  - Blood type registration
  - Location tracking for proximity matching

- **Emergency SOS**
  - One-click blood request creation
  - Automatic matching with compatible donors
  - Real-time status tracking

- **Smart Donor Matching**
  - Blood type compatibility checking
  - Distance-based donor sorting
  - Live location updates

- **Direct Communication**
  - Instant phone call connection
  - Donor response tracking
  - Request status monitoring

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Local Storage for data persistence

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm (Node Package Manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blood-buddy.git
cd blood-buddy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Account Creation
- Sign up with your phone number
- Set your blood type
- Enable location access

### 2. Making Blood Requests
- Click the "NEED BLOOD - SEND SOS" button
- Your request will be visible to nearby compatible donors
- Track responses in real-time

### 3. Responding to Requests
- View nearby blood requests
- Check compatibility and distance
- Accept requests and call requesters directly

### 4. Managing Requests
- Track your active requests
- View donor responses
- Contact donors through direct phone calling

## Blood Type Compatibility

The app automatically matches donors based on the following compatibility chart:

| Recipient | Can Receive From |
|-----------|-----------------|
| A+        | A+, A-, O+, O- |
| A-        | A-, O-         |
| B+        | B+, B-, O+, O- |
| B-        | B-, O-         |
| AB+       | All Types      |
| AB-       | A-, B-, AB-, O-|
| O+        | O+, O-         |
| O-        | O-             |

## Development

The project uses Next.js with TypeScript for type safety and improved developer experience. Tailwind CSS is used for styling, providing a responsive and modern UI.

### Project Structure
```
blood-buddy/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── BloodBuddyApp.tsx
│   ├── lib/
│   │   └── storage.ts
│   └── types/
│       └── global.d.ts
├── public/
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- Icons by Lucide React
- Styled with Tailwind CSS