'use client';

import { useEffect, useState } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import * as StacksConnectNamespace from '@stacks/connect';
import { network } from './network';

// Debug log to confirm file reload
console.log("useStacksAuth.ts loaded - Debug Mode");

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export function useStacksAuth() {
  const [userData, setUserData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const connectWallet = async () => {
    if (!isMounted) return;
    console.log("Initiating wallet connection...");

    // Strategy 1: Try 'showConnect' from namespace
    let showConnectFn = StacksConnectNamespace.showConnect || 
                        (StacksConnectNamespace as any).default?.showConnect;

    // Strategy 2: Try 'authenticate' (alias for showConnect)
    if (!showConnectFn) {
         console.warn("showConnect missing, trying 'authenticate'...");
         showConnectFn = StacksConnectNamespace.authenticate ||
                         (StacksConnectNamespace as any).default?.authenticate;
    }

    // Strategy 3: Dynamic Import @stacks/connect
    if (!showConnectFn) {
      console.warn("showConnect/authenticate missing in namespace, trying dynamic import of @stacks/connect...");
      try {
        const module = await import('@stacks/connect');
        showConnectFn = module.showConnect || module.authenticate || module.default?.showConnect || module.default?.authenticate;
      } catch (e) {
        console.error("Dynamic import of @stacks/connect failed:", e);
      }
    }

    if (typeof showConnectFn === 'function') {
      console.log("showConnect/authenticate function resolved, executing...");
      showConnectFn({
        appDetails: {
          name: 'USDCx Integration Studio',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '/favicon.ico',
        },
        redirectTo: '/',
        onFinish: () => {
          setUserData(userSession.loadUserData());
        },
        userSession,
      });
    } else {
      console.error("CRITICAL: showConnect could not be resolved. Namespace keys:", Object.keys(StacksConnectNamespace));
      alert("Critical Error: Wallet connection library failed to load. Please check the browser console.");
    }
  };

  const deployContract = async (options: any) => {
    let openContractDeployFn = StacksConnectNamespace.openContractDeploy || 
                               (StacksConnectNamespace as any).default?.openContractDeploy;

    if (!openContractDeployFn) {
        try {
            const module = await import('@stacks/connect');
            openContractDeployFn = module.openContractDeploy || module.default?.openContractDeploy;
        } catch (e) {
            console.error("Dynamic import failed:", e);
        }
    }

    if (typeof openContractDeployFn === 'function') {
        openContractDeployFn(options);
    } else {
        console.error("Could not load openContractDeploy function.");
        alert("Error: Contract deployment library could not be loaded.");
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  return { userSession, userData, connectWallet, disconnectWallet, deployContract, network };
}
