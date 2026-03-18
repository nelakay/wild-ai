'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  useDisclosure,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { ThemeMode } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const APP_VERSION = '0.1.0';
const ALGORITHM_VERSION = '0.1.0';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const { reset: resetOnboarding } = useOnboardingStore();

  const deleteModal = useDisclosure();

  // Mock wearable state
  const [zeppConnected, setZeppConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    logout();
    router.push('/');
  };

  const handleZeppToggle = () => {
    if (zeppConnected) {
      setZeppConnected(false);
      setLastSync(null);
      alert('Zepp disconnected.');
    } else {
      setZeppConnected(true);
      setLastSync(new Date().toISOString());
      alert('Zepp connected successfully!');
    }
  };

  const handleExportData = () => {
    alert('Data export will be available in a future update.');
  };

  const handleDeleteAccount = () => {
    deleteModal.onClose();
    logout();
    router.push('/');
  };

  const formatLifeStage = (stage: string | undefined) => {
    if (!stage) return 'Not set';
    return stage
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatExperienceLevel = (level: string | undefined) => {
    if (!level) return 'Not set';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* ----------------------------------------------------------------- */}
      {/* Profile Section                                                    */}
      {/* ----------------------------------------------------------------- */}
      <Card shadow="sm">
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold">Profile</h2>
        </CardHeader>
        <CardBody className="gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {(user?.avatar_name ?? 'W').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {user?.avatar_name ?? 'Wild Athlete'}
              </p>
              <p className="text-sm text-default-500">
                {user?.email ?? 'Not signed in'}
              </p>
            </div>
          </div>

          <Divider />

          <ProfileRow label="Sport" value={user?.sport_type ?? 'Not set'} />
          <ProfileRow
            label="Experience"
            value={formatExperienceLevel(user?.experience_level)}
          />
          <ProfileRow
            label="Life Stage"
            value={formatLifeStage(user?.life_stage)}
          />

          <div className="flex gap-2 mt-1">
            <Button
              variant="bordered"
              size="sm"
              onPress={() => alert('Edit profile coming soon!')}
            >
              Edit Profile
            </Button>
            <Button
              variant="bordered"
              size="sm"
              onPress={() => {
                resetOnboarding();
                router.push('/onboarding');
              }}
            >
              Redo Onboarding
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Theme Section                                                      */}
      {/* ----------------------------------------------------------------- */}
      <Card shadow="sm">
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold">Appearance</h2>
        </CardHeader>
        <CardBody>
          <Tabs
            selectedKey={mode}
            onSelectionChange={(key) => setMode(key as ThemeMode)}
            variant="bordered"
            fullWidth
            aria-label="Theme selection"
          >
            <Tab key="light" title="Light" />
            <Tab key="dark" title="Dark" />
            <Tab key="system" title="System" />
          </Tabs>
        </CardBody>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Wearable Connections                                               */}
      {/* ----------------------------------------------------------------- */}
      <Card shadow="sm">
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold">Wearable Connections</h2>
        </CardHeader>
        <CardBody className="gap-3">
          {/* Zepp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-lg">{'\u231A'}</span>
              </div>
              <div>
                <p className="font-medium text-sm">Zepp</p>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      zeppConnected ? 'bg-success' : 'bg-default-300'
                    }`}
                  />
                  <span className="text-xs text-default-500">
                    {zeppConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {lastSync && (
                  <p className="text-xs text-default-400">
                    Last sync: {new Date(lastSync).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant={zeppConnected ? 'bordered' : 'solid'}
              color={zeppConnected ? 'default' : 'primary'}
              onPress={handleZeppToggle}
            >
              {zeppConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>

          <Divider />

          {/* Apple Health */}
          <div className="flex items-center justify-between opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="text-lg">{'\u2764\uFE0F'}</span>
              </div>
              <div>
                <p className="font-medium text-sm">Apple Health</p>
                <Chip size="sm" variant="flat" color="default">
                  Coming in V2
                </Chip>
              </div>
            </div>
            <Button size="sm" variant="bordered" isDisabled>
              Connect
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Data & Privacy                                                     */}
      {/* ----------------------------------------------------------------- */}
      <Card shadow="sm">
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold">Data & Privacy</h2>
        </CardHeader>
        <CardBody className="gap-3">
          <Button
            variant="bordered"
            size="sm"
            fullWidth
            onPress={handleExportData}
          >
            Export My Data
          </Button>

          <Button
            variant="bordered"
            size="sm"
            color="danger"
            fullWidth
            onPress={deleteModal.onOpen}
          >
            Delete My Account
          </Button>

          <Button
            variant="light"
            size="sm"
            fullWidth
            onPress={() => alert('Privacy policy page coming soon.')}
            className="text-default-500"
          >
            Privacy Policy
          </Button>
        </CardBody>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* About                                                              */}
      {/* ----------------------------------------------------------------- */}
      <Card shadow="sm">
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold">About</h2>
        </CardHeader>
        <CardBody className="gap-2">
          <ProfileRow label="App Version" value={APP_VERSION} />
          <ProfileRow label="Algorithm Version" value={ALGORITHM_VERSION} />

          <Divider className="my-1" />

          <Button
            color="danger"
            variant="flat"
            fullWidth
            onPress={handleSignOut}
            className="font-semibold"
          >
            Sign Out
          </Button>
        </CardBody>
      </Card>

      {/* Spacer for bottom nav */}
      <div className="h-4" />

      {/* ----------------------------------------------------------------- */}
      {/* Delete Account Confirmation Modal                                  */}
      {/* ----------------------------------------------------------------- */}
      <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange}>
        <ModalContent className="bg-white dark:bg-zinc-900">
          {(onClose) => (
            <>
              <ModalHeader>Delete Account</ModalHeader>
              <ModalBody>
                <p className="text-sm">
                  Are you sure you want to delete your account? This action
                  cannot be undone. All your data will be permanently removed.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteAccount}>
                  Delete Account
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-default-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
