import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/client';
import React, { useEffect } from 'react';
import UserProfileLoader from '../../src/features/common/ContentLoaders/UserProfile/UserProfile';
import TPOProfile from '../../src/features/user/UserProfile/screens/TpoProfile';
import GetPublicUserProfileMeta from '../../src/utils/getMetaTags/GetPublicUserProfileMeta';
import Footer from '../../src/features/common/Layout/Footer';
import { getRequest } from '../../src/utils/apiRequests/api';
import IndividualProfile from '../../src/features/user/UserProfile/screens/IndividualProfile';
import PrivateUserProfile from '../../src/features/user/UserProfile/screens/PrivateIndividualProfile';
import {
  getUserExistsInDB,
  getUserSlug,
  setUserExistsInDB,
  removeUserExistsInDB,
  removeUserSlug
} from '../../src/utils/auth0/localStorageUtils';
import {getAccountInfo } from '../../src/utils/auth0/getAccountInfo'

interface Props {
  initialized: Boolean;
}

export default function PublicUser(initialized: Props) {
  const [session, loading] = useSession();
  const [publicUserprofile, setPublicUserprofile] = React.useState();
  const [privateUserprofile, setPrivateUserprofile] = React.useState();
  const [slug, setSlug] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [forceReload, changeForceReload] = React.useState(false);

  const router = useRouter();
  const PublicUserProps = {
    publicUserprofile,
  };
  const PrivateUserProps = {
    privateUserprofile,
    changeForceReload,
    forceReload,
  };

  useEffect(() => {
    if (router && router.query.id !== undefined) {
      setSlug(router.query.id);
      setReady(true);
    }
  }, [router]);
  useEffect(() => {
    async function loadUserData() {
      if (typeof Storage !== 'undefined') {
        const userExistsInDB = getUserExistsInDB();
        const currentUserSlug = getUserSlug();

        // some user logged in and slug matches -> private profile
        if (!loading && session && userExistsInDB && currentUserSlug === slug) {
          try {
            const res = await getAccountInfo(session)
            if (res.status === 200) {
              console.log('in 200-> user exists in our DB');
              const resJson = await res.json();
              setPrivateUserprofile(resJson);
            } else if (res.status === 303) {
              // if 303 -> user doesn not exist in db
              console.log('in 303-> user does not exist in our DB')
              setUserExistsInDB(false)
              if (typeof window !== 'undefined') {
                router.push('/complete-signup');
              }
            } else if (res.status === 401){
              // in case of 401 - invalid token: signIn()
              console.log('in 401-> unauthenticated user / invalid token')
              signOut()
              removeUserExistsInDB()
              removeUserSlug()
              signIn('auth0', { callbackUrl: '/login' });
            } else {
              // any other error
              console.log('in else -> other error')
            }
          } catch (e) {}
        } else {
          //no user logged in or slug mismatch -> public profile
          const newPublicUserprofile = await getRequest(
            `/public/v1.0/en/treecounter/${slug}`
          );
          setPublicUserprofile(newPublicUserprofile);
        }
      }
    }

    // ready is for router, loading is for session
    if (ready && !loading) {
      loadUserData();
    }
  }, [ready, loading, forceReload]);

  function getPublicUserProfile() {
    switch (publicUserprofile?.userProfile.type) {
      case 'tpo':
        return (
          <>
            <GetPublicUserProfileMeta publicUserprofile={publicUserprofile} />
            <TPOProfile {...PublicUserProps} />
            <Footer />
          </>
        );
      case 'individual':
        return (
          <>
            <GetPublicUserProfileMeta publicUserprofile={publicUserprofile} />
            <IndividualProfile {...PublicUserProps} />
            <Footer />
          </>
        );
    }
  }

  if (initialized && (publicUserprofile || privateUserprofile)) {
    if (publicUserprofile) {
      return getPublicUserProfile();
    } else if (privateUserprofile) {
      return (
        <>
          <PrivateUserProfile
            style={{ height: '100vh', overflowX: 'hidden' }}
            {...PrivateUserProps}
          />
          <Footer />
        </>
      );
    }
  } else {
    return <UserProfileLoader />;
  }
}
