import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

interface UserAddressRegistrationResponse {
  address: string;
}

interface Exposure {
  category: string;
  value: number;
}

interface RuleTriggered {
  risk: string;
  minThreshold: number;
  maxThreshold: number;
}

interface Trigger {
  category: string;
  percentage: number;
  message: string;
  ruleTriggered: RuleTriggered;
}

interface AddressIdentification {
  name: string;
  category: string;
  description: string;
}

interface Cluster {
  name: string;
  category: string;
}

interface UserAddressRiskResponse {
  address: string;
  risk: string;
  riskReason: string | null;
  cluster: Cluster | null;
  addressIdentifications: AddressIdentification[];
  exposures: Exposure[];
  triggers: Trigger[];
  status: string;
}

interface UseRiskReturnType {
  risk: string | undefined;
  fetchUserAddressRisk: () => Promise<string>;
  isLoading: boolean;
  isRiskCheckingEnabled: boolean;
}

export function useRisk(): UseRiskReturnType {
  const { address } = useAccount();

  const { data: risk, isLoading } = useQuery({
    queryKey: ['userAddressRisk', address],
    queryFn: registerAndFetchUserAddressRisk,
    enabled: !!address && appConfiguration.enableRisk,
  });

  async function registerAndFetchUserAddressRisk(): Promise<string> {
    if (!address) {
      throw new Error('Address is required');
    }

    await registerUserAddress(address);

    const fetchUserAddressRiskResponse = await fetchUserAddressRisk(address);

    return fetchUserAddressRiskResponse.risk;
  }

  async function fetchUserAddressRisk(userAddress: string): Promise<UserAddressRiskResponse> {
    const netlifyFunctionEndpoint = `/.netlify/functions/fetch-user-address-risk?address=${userAddress}`;
    const response = await fetch(netlifyFunctionEndpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  }

  async function registerUserAddress(
    userAddress: string
  ): Promise<UserAddressRegistrationResponse> {
    const netlifyFunctionEndpoint = `/.netlify/functions/register-user-address?address=${userAddress}`;

    const response = await fetch(netlifyFunctionEndpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  }

  return {
    risk,
    fetchUserAddressRisk: registerAndFetchUserAddressRisk,
    isLoading,
    isRiskCheckingEnabled: appConfiguration.enableRisk,
  };
}
