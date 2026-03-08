/**
 * LocationSync component — invisible component to sync user location on app mount/login.
 */

import React, { useEffect } from 'react';
import { useAuthContext } from '@/context/auth-context';
import { syncUserLocationAutomatically } from '@/utils/location';

export function LocationSync() {
    const { user } = useAuthContext();

    useEffect(() => {
        if (user) {
            // Sync location once per session or on app mount if logged in
            syncUserLocationAutomatically();
        }
    }, [user?._id]); // Re-sync if user changes (e.g. login/logout)

    return null;
}
