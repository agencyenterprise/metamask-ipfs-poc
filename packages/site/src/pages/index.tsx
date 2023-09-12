import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import {
  Card,
  CardDescription,
  CardTitle,
  CardWrapper,
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Input,
} from '../components';
import { defaultSnapOrigin } from '../config';
import { MetaMaskContext, MetamaskActions } from '../hooks';
import {
  clearState,
  connectSnap,
  getAPIKeys,
  getPersistedState,
  getSnap,
  persistState,
  saveAPIKey,
  shouldDisplayReconnectButton,
} from '../utils';
import { ApiKeys } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex-direction: column;
  flex-wrap: wrap;
  max-width: 80rem;
  gap: 2.4rem;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  grid-column: span 2 / span 2;
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [apiKeys, setApiKeys] = useState({} as ApiKeys);

  // Load saved API key if connected
  useEffect(() => {
    if (state.installedSnap) {
      getAPIKeys(state.installedSnap.id)
        .then((r) => setApiKeys(r.apiKeys))
        .catch((e) => {
          console.error(e);
          dispatch({ type: MetamaskActions.SetError, payload: e });
        });
    }
  }, [state.installedSnap]);

  useEffect(() => {
    function handleError(e: any) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }

    if (state.installedSnap && apiKeys?.pinata) {
      // clearState(state.installedSnap.id)
      //   .then(() => console.log('Clean! 🧹'))
      //   .catch(handleError);
      // getPersistedState(state.installedSnap.id)
      //   .then((r) => console.log(r))
      //   .catch(handleError);
      persistState(state.installedSnap.id, {
        timestamp: new Date().toISOString(),
      })
        .then(() => console.log('Success! 🚀'))
        .catch(handleError);
    }
  }, [state.installedSnap, apiKeys]);

  const handleConnectClick = async () => {
    try {
      await connectSnap(defaultSnapOrigin);
      const installedSnap = await getSnap(defaultSnapOrigin);

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  // Update UI when API key changes and save it in the snap
  const handleKeyChanged = async (
    e: React.ChangeEvent<HTMLInputElement>,
    provider: 'pinata' | 'infura',
  ) => {
    setApiKeys({ ...apiKeys, [provider]: e.target.value });
    if (state.installedSnap) {
      try {
        await saveAPIKey(state.installedSnap.id, e.target.value);
      } catch (e) {
        console.error(e);
        dispatch({ type: MetamaskActions.SetError, payload: e });
      }
    }
  };

  return (
    <Container>
      <Heading>
        Set up your <Span>IPFS</Span> connection
      </Heading>

      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}

        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}

        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description: 'Get started by connecting MetaMask to the snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}

        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'Reconnect to the snap to update to the latest version.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}

        <CardWrapper disabled={!state.installedSnap}>
          <CardTitle>Add your Piñata JWT</CardTitle>
          <CardDescription>
            Enter a Piñata JWT to connect to your Piñata account and save your
            data.
          </CardDescription>
          <Input
            type="password"
            placeholder="Piñata JWT"
            value={apiKeys?.pinata}
            onChange={(e) => handleKeyChanged(e, 'pinata')}
          />
        </CardWrapper>
        <CardWrapper disabled={!state.installedSnap}>
          <CardTitle>Add your Infura IPFS API Key</CardTitle>
          <CardDescription>
            Enter an Infura IPFS API Key to connect to your Infura account and
            save your data.
          </CardDescription>
          <Input
            type="password"
            placeholder="API_KEY:API_SECRET"
            value={apiKeys?.infura}
            onChange={(e) => handleKeyChanged(e, 'infura')}
          />
        </CardWrapper>
      </CardContainer>
    </Container>
  );
};

export default Index;
