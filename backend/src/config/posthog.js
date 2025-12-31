import { PostHog } from "posthog-node";

const posthog = new PostHog(
    process.env.POSTHOG_API_KEY,
    {
        host: "https://us.posthog.com"
    }
);

export default posthog;