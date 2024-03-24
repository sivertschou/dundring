import { Center, Link, Stack, Text } from '@chakra-ui/react';
import { githubRepo, slackInvite } from '../links';
import { CompatibleWithStravaIcon } from './CompatibleWithStravaIcon';

export const Footer = () => {
  return (
    <Center pb="300px" px="2">
      <Stack maxW="600px" color="#999">
        <Text>
          dundring.com is an in-browser training application created to control
          and track your training with a smart bike trainer.
        </Text>

        <Text>
          Contribute to the project on{' '}
          <Link href={githubRepo} textDecoration="underline">
            GitHub
          </Link>{' '}
          and join the discussions or reach out for help in the{' '}
          <Link href={slackInvite} textDecoration="underline">
            Slack workspace
          </Link>
          !
        </Text>
        <Center>
          <CompatibleWithStravaIcon maxW="150px" />
        </Center>
      </Stack>
    </Center>
  );
};
