import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx'; // Assuming you have a Header component


const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`, // Assuming you're using access/refresh tokens
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logoutUser(); // Token might be expired
            return;
          }
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch profile');
          return;
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Network error while fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authTokens, logoutUser]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div>No profile information available.</div>;
  }

  return (
    <div>
      <Header /> {/* Include your header */}
      <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
        {profile.username && <p className="mb-2"><strong>Username:</strong> {profile.username}</p>}
        {profile.email && <p className="mb-2"><strong>Email:</strong> {profile.email}</p>}
        {profile.role && <p className="mb-2"><strong>Role:</strong> {profile.role}</p>}
        {/* Display other profile information as needed */}
      </div>
    </div>
  );
};

export default ProfilePage;