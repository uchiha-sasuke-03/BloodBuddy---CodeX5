'use client';

import React, { useState, useEffect } from 'react';
import storage from '../lib/storage';
import { AlertCircle, Droplet, MapPin, Phone, Clock, UserPlus, LogIn, LogOut, User } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  bloodType: string;
  location: Location;
  createdAt: string;
}

interface Donor {
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorBloodType: string;
  acceptedAt: string;
}

interface BloodRequest {
  id: string;
  userId: string;
  requesterName: string;
  requesterPhone: string;
  bloodNeeded: string;
  location: Location;
  status: 'active' | 'completed';
  createdAt: string;
  acceptedBy: Donor[];
}

const BloodBuddyApp = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [view, setView] = useState<'auth' | 'dashboard'>('auth');
  
  // Auth form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [isSignup, setIsSignup] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const compatibleBloodTypes: Record<string, string[]> = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  // Load data from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    if (currentUser && users.length > 0) {
      saveToStorage();
    }
  }, [users, requests, currentUser]);

  const loadFromStorage = async () => {
    try {
  const storedUsers = await storage.get('bloodbuddy_users');
  const storedRequests = await storage.get('bloodbuddy_requests');
  const storedCurrentUser = await storage.get('bloodbuddy_current_user');
      
      if (storedUsers?.value) {
        setUsers(JSON.parse(storedUsers.value));
      }
      if (storedRequests?.value) {
        setRequests(JSON.parse(storedRequests.value));
      }
      if (storedCurrentUser?.value) {
        const user = JSON.parse(storedCurrentUser.value);
        setCurrentUser(user);
        setView('dashboard');
      }
    } catch (error) {
      console.log('No stored data found, starting fresh');
      setUsers([]);
      setRequests([]);
    }
  };

  const saveToStorage = async () => {
    try {
      await storage.set('bloodbuddy_users', JSON.stringify(users));
      await storage.set('bloodbuddy_requests', JSON.stringify(requests));
      if (currentUser) {
        await storage.set('bloodbuddy_current_user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const saveUserData = async (usersData: User[], requestsData: BloodRequest[], currentUserData: User) => {
    try {
  await storage.set('bloodbuddy_users', JSON.stringify(usersData));
  await storage.set('bloodbuddy_requests', JSON.stringify(requestsData));
  await storage.set('bloodbuddy_current_user', JSON.stringify(currentUserData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          alert('✓ Location captured!');
        },
        () => {
          setUserLocation({
            lat: 12.9716 + (Math.random() - 0.5) * 0.1,
            lng: 77.5946 + (Math.random() - 0.5) * 0.1
          });
          alert('✓ Demo location set!');
        }
      );
    } else {
      setUserLocation({
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lng: 77.5946 + (Math.random() - 0.5) * 0.1
      });
      alert('✓ Demo location set!');
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedPhone = phone.replace(/\D/g, '');
    
    if (cleanedPhone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (isSignup) {
      if (!name.trim()) {
        alert('Please enter your full name');
        return;
      }
      
      if (!userLocation) {
        alert('Please enable location access first');
        return;
      }

      if (users.find(u => u.phone === cleanedPhone)) {
        alert('This phone number is already registered. Please login.');
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: cleanedPhone,
        password,
        bloodType,
        location: userLocation,
        createdAt: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      saveUserData(updatedUsers, requests, newUser);
      setView('dashboard');
      alert('Account created successfully!');
    } else {
      const user = users.find(u => u.phone === cleanedPhone && u.password === password);
      if (user) {
        let updatedUser = user;
        if (userLocation) {
          updatedUser = { ...user, location: userLocation };
          const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
          setUsers(updatedUsers);
          saveUserData(updatedUsers, requests, updatedUser);
        } else {
          saveUserData(users, requests, user);
        }
        
        setCurrentUser(updatedUser);
        setView('dashboard');
        alert('Logged in successfully!');
      } else {
        alert('Invalid phone number or password. Try signing up first!');
      }
    }
  };

  const handleLogout = async () => {
    try {
  await storage.delete('bloodbuddy_current_user');
    } catch (error) {
      console.log('Logout cleanup');
    }
    setCurrentUser(null);
    setView('auth');
    setName('');
    setPhone('');
    setPassword('');
    setUserLocation(null);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const createSOS = () => {
    if (!currentUser?.location) {
      alert('Location not available. Please update your location from settings.');
      return;
    }
    
    const newRequest: BloodRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      requesterName: currentUser.name,
      requesterPhone: currentUser.phone,
      bloodNeeded: currentUser.bloodType,
      location: currentUser.location,
      status: 'active',
      createdAt: new Date().toISOString(),
      acceptedBy: []
    };
    
    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    saveToStorage();
    alert('🚨 SOS Alert Sent! Nearby compatible donors will be notified.');
  };

  const getNearbyRequests = () => {
    if (!currentUser) return [];
    
    return requests
      .filter(req => {
        if (req.userId === currentUser.id) return false;
        if (req.status !== 'active') return false;
        
        const distance = calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          req.location.lat,
          req.location.lng
        );
        
        const compatible = compatibleBloodTypes[req.bloodNeeded]?.includes(currentUser.bloodType);
        
        return distance < 10 && compatible;
      })
      .map(req => ({
        ...req,
        distance: calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          req.location.lat,
          req.location.lng
        ).toFixed(1)
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const getMyRequests = () => {
    if (!currentUser) return [];
    return requests.filter(req => req.userId === currentUser.id);
  };

  const acceptRequest = (requestId: string) => {
    if (!currentUser) return;
    
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          acceptedBy: [...req.acceptedBy, {
            donorId: currentUser.id,
            donorName: currentUser.name,
            donorPhone: currentUser.phone,
            donorBloodType: currentUser.bloodType,
            acceptedAt: new Date().toISOString()
          }]
        };
      }
      return req;
    });
    
    setRequests(updatedRequests);
    
    const request = requests.find(r => r.id === requestId);
    if (request) {
      alert(`✓ Request Accepted!\n\n📞 Call Now: ${formatPhoneNumber(request.requesterPhone)}\n👤 Name: ${request.requesterName}\n🩸 Blood Type: ${request.bloodNeeded}`);
    }
  };

  const callDonor = (donorPhone: string) => {
    window.location.href = `tel:${donorPhone}`;
  };

  const declineRequest = (requestId: string) => {
    alert('Request declined. It will remain visible to other donors.');
  };

  // Auth Screen
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Droplet size={48} className="mx-auto mb-3" color="#e53e3e" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BloodBuddy</h1>
            <p className="text-gray-600 text-sm">Connecting donors via phone in emergencies</p>
          </div>
          
          <form onSubmit={handleAuth}>
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg text-base"
              />
            )}

            <input
              type="tel"
              placeholder="Phone Number (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg text-base"
            />
            
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg text-base"
            />
            
            {isSignup && (
              <select 
                value={bloodType} 
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg text-base"
              >
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
            
            <button 
              type="button" 
              onClick={getLocation}
              className={`w-full p-3 mb-3 flex items-center justify-center gap-2 text-white rounded-lg text-base
                ${userLocation ? 'bg-green-500' : 'bg-blue-500'}`}
            >
              <MapPin size={20} />
              {userLocation ? '✓ Location Captured' : isSignup ? 'Enable Location (Required)' : 'Update Location (Optional)'}
            </button>
            
            <button 
              type="submit"
              className="w-full p-4 mb-3 bg-red-600 text-white rounded-lg text-lg font-bold flex items-center justify-center gap-2"
            >
              {isSignup ? <><UserPlus size={20} /> Sign Up</> : <><LogIn size={20} /> Login</>}
            </button>
          </form>
          
          <p 
            className="text-center text-blue-500 cursor-pointer text-sm" 
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </p>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  const nearbyRequests = getNearbyRequests();
  const myRequests = getMyRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Droplet size={32} />
            <h1 className="text-2xl font-bold m-0">BloodBuddy</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2.5 bg-white/20 text-white border-2 border-white rounded-lg flex items-center gap-2 text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-5">
        {currentUser && (
          <>
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-xl shadow mb-5">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="m-0 mb-2 text-gray-800 flex items-center gap-2">
                    <User size={20} /> {currentUser.name}
                  </h3>
                  <div className="flex gap-4 flex-wrap text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Droplet size={16} className="text-red-600" /> Blood Type: <strong>{currentUser.bloodType}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={16} /> {formatPhoneNumber(currentUser.phone)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SOS Button */}
            <button 
              onClick={createSOS}
              className="w-full p-6 text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl
                      shadow-lg shadow-red-600/30 mb-8 flex items-center justify-center gap-3 transition-transform
                      hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertCircle size={32} /> 🚨 NEED BLOOD - SEND SOS
            </button>

            {/* My Requests */}
            {myRequests.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <Clock size={24} /> My Active Requests
                </h2>
                {myRequests.map(req => (
                  <div key={req.id} className="bg-red-50 border-2 border-red-300 p-5 rounded-xl mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="m-0 mb-2 text-lg font-bold text-gray-800">
                          Blood Type Needed: {req.bloodNeeded}
                        </p>
                        <p className="m-0 text-sm text-gray-600">
                          Created: {new Date(req.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
                        ACTIVE
                      </span>
                    </div>
                    
                    {req.acceptedBy.length > 0 ? (
                      <div className="bg-white p-3 rounded-lg mt-3">
                        <p className="m-0 mb-3 font-bold text-green-500 text-base">
                          ✓ {req.acceptedBy.length} Donor(s) Accepted!
                        </p>
                        {req.acceptedBy.map((donor, idx) => (
                          <div key={idx} className={`p-3 bg-gray-50 rounded-lg ${idx > 0 ? 'mt-2' : ''}`}>
                            <div className="flex justify-between items-center mb-2">
                              <p className="m-0 text-base font-bold text-gray-800">
                                {donor.donorName} ({donor.donorBloodType})
                              </p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Phone size={16} className="text-red-600" />
                              <a 
                                href={`tel:${donor.donorPhone}`}
                                className="text-base text-red-600 no-underline font-bold"
                              >
                                {formatPhoneNumber(donor.donorPhone)}
                              </a>
                            </div>
                            <button
                              onClick={() => callDonor(donor.donorPhone)}
                              className="mt-2 w-full p-2.5 bg-green-500 text-white rounded text-sm font-bold flex items-center justify-center gap-1.5"
                            >
                              <Phone size={16} /> Call Now
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 mb-0 text-sm text-gray-600">
                        Waiting for donors to respond...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Nearby Requests */}
            <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={24} /> Nearby Blood Requests ({nearbyRequests.length})
            </h2>
            
            {nearbyRequests.length === 0 ? (
              <div className="bg-white p-10 rounded-xl text-center text-gray-600">
                <Droplet size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="m-0 text-base">No active requests nearby at the moment.</p>
                <p className="mt-2 mb-0 text-sm">You'll be notified when someone needs your blood type.</p>
              </div>
            ) : (
              nearbyRequests.map(request => (
                <div key={request.id} className="bg-white border-2 border-red-600 p-5 rounded-xl mb-4 shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="m-0 mb-2 text-xl font-bold text-red-600">
                        🩸 {request.bloodNeeded} Blood Needed
                      </p>
                      <div className="text-sm text-gray-600">
                        <p className="my-1 flex items-center gap-1.5">
                          <MapPin size={16} /> <strong>{request.distance} km away</strong>
                        </p>
                        <p className="my-1 flex items-center gap-1.5">
                          <Clock size={16} /> {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="m-0 mb-2 text-base font-bold text-gray-800 flex items-center gap-1.5">
                      <User size={18} /> {request.requesterName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-red-600" />
                      <a 
                        href={`tel:${request.requesterPhone}`}
                        className="text-lg text-red-600 no-underline font-bold"
                      >
                        {formatPhoneNumber(request.requesterPhone)}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => acceptRequest(request.id)}
                      className="flex-1 p-3.5 bg-green-500 text-white rounded-lg text-base font-bold flex items-center justify-center gap-2"
                    >
                      <Phone size={18} /> Accept & Call
                    </button>
                    <button 
                      onClick={() => declineRequest(request.id)}
                      className="flex-1 p-3.5 bg-gray-200 text-gray-600 rounded-lg text-base font-bold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BloodBuddyApp;