"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { UserCircleIcon, EnvelopeIcon, Cog8ToothIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { data: session, status} = useSession();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
//   const [passwordMessage, setPasswordMessage] = useState('');
//   const [passwordError, setPasswordError] = useState('');


  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/dashboard/settings");
    }
    if (session?.user) {
        const nameParts = session.user.name?.split(' ') || [];
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
    }
  }, [status, router, session]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    setProfileMessage('');
    setProfileError('');

    // ** API Call to update user profile (e.g., name) **
    // try {
    //   const res = await fetch('/api/user/profile', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ firstName, lastName }),
    //   });
    //   const data = await res.json();
    //   if (!res.ok) throw new Error(data.message || "Failed to update profile.");
    //   setProfileMessage("Profile updated successfully!");
    //   await update({ user: { ...session?.user, name: `${firstName} ${lastName}` } }); // Optimistic update
    //   // Or call update() without args to refetch session
    // } catch (err: any) {
    //   setProfileError(err.message);
    // } finally {
    //   setIsSubmittingProfile(false);
    // }
    
    // Placeholder:
    setTimeout(async () => {
        setProfileMessage("Profile update simulated. Implement backend API.");

        // await update({ user: { ...session?.user, name: `${firstName} ${lastName}` } });
        // await update();
        setIsSubmittingProfile(false);
    }, 1500);
  };

  if (status === "loading" || !session) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Loading Settings...</p></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold leading-tight text-slate-800">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your profile information, preferences, and security settings.
          </p>
        </header>

        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center mb-6">
            <UserCircleIcon className="h-8 w-8 text-orange-500 mr-3"/>
            <h2 className="text-xl font-semibold text-slate-700">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" name="firstName" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" name="lastName" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                </div>
            </div>
             <div>
                <label htmlFor="email_settings" className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input type="email" name="email_settings" id="email_settings" value={session.user?.email || ''} disabled className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-100 py-2 px-3 cursor-not-allowed" />
                </div>
            </div>
            {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            <div className="text-right">
                <button type="submit" disabled={isSubmittingProfile} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                    {isSubmittingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
            </div>
          </form>
        </div>

        {session.user?.provider === 'credentials' && (
            <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-8">
                <div className="flex items-center mb-6">
                    <ShieldCheckIcon className="h-8 w-8 text-orange-500 mr-3"/>
                    <h2 className="text-xl font-semibold text-slate-700">Security</h2>
                </div>
                <p className="text-slate-600">
                    You can <Link href="/reset-password" className="text-orange-600 hover:text-orange-500 font-medium">change your password here</Link> if you&apos;ve forgotten it, or build a change password form directly on this page.
                </p>
                
                <form className="space-y-6">
                    <div>... Current Password ...</div>
                    <div>... New Password ...</div>
                    <div>... Confirm New Password ...</div>
                    <button type="submit">Change Password</button>
                </form>
               
            </div>
        )}
        
        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
           <div className="flex items-center mb-6">
                <Cog8ToothIcon className="h-8 w-8 text-orange-500 mr-3"/>
                <h2 className="text-xl font-semibold text-slate-700">Cooking Preferences</h2>
            </div>
            <p className="text-slate-600">
                Customize your DishWish experience. (e.g., default dietary restrictions, preferred cuisines, notification settings). This section is a placeholder for future enhancements.
            </p>
        </div>
         <div className="mt-8 text-center">
            <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                ← Back to Dashboard
            </Link>
        </div>
      </div>
    </div>
  );
}