# AI Companion — Voice-first foundation

## Experience
- Floating companion offers text, browser microphone speech recognition, automatic speech synthesis, replay, and adjustable pitch/rate.
- Indonesian is the default. A Javanese language preference asks the model for polite, natural Javanese and requests a Javanese browser voice where installed. A “medok” accent cannot be guaranteed by pitch/rate; it requires a suitable licensed voice/TTS provider.
- Speech is browser/device speech synthesis. The application does not upload raw microphone audio through this feature; speech recognition may be implemented by the browser/vendor, and the resulting transcript is posted to the app API.
- AI provider is configured server-side through `AI_API_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`. Use a supported OpenAI-compatible Chat Completions endpoint. Never place API keys in `NEXT_PUBLIC_*` or client code.

## Agent knowledge seeded in the system prompt
The companion has a conservative initial instruction set derived from the SIJPH multi-agent contracts:
Intake & Interview; Fact & Evidence; Urgency & Safeguarding; Jurisdiction & Issue Spotter; Legal Research; Legal Status & Amendment; Procedure & Deadline; Scenario Simulation; Counterargument/Red-Team; Citation & Quality Verifier; Privacy & Security Gate; Human Review Coordinator; Client Companion; Aftercare; Knowledge Steward.

These are **design contracts and prompt context**, not agents actually orchestrated at runtime. Current endpoint does not access the legal-source registry, retrieve verified regulations, inspect case files, or provide pinpoint citations. It must say so plainly. Do not present unverified model output as legal certainty. The next phase is source-grounded retrieval with official-source snapshots, version/status checks, citations, adversarial evaluation, and human approval gates.

## Safety
- Public conversation is not a channel for confidential case facts or evidence.
- The API validates payloads, limits message length/history, applies a process-local request throttle, uses a timeout, and does not persist chat transcripts itself. Process-local rate limiting is only a temporary control; deploy-grade distributed throttling, abuse detection and provider budget controls are still needed.
- AI endpoint returns 503 until provider credentials/model are configured. This is intentional; it does not silently fall back to canned legal advice.
- Before public activation: verify provider data-processing terms/retention/location; approve privacy notice; configure production secrets; run legal safety/evaluation tests; and verify the deployed endpoint.
- Do not send messages to clients, file documents, calculate hard legal deadlines, or change case state autonomously.

## Voice quality
The browser's SpeechSynthesis API exposes language, voice, pitch and rate but not a reliable phoneme-level accent or emotion control. For premium natural CS voice and genuinely medok Javanese, add a licensed Indonesian/Javanese neural TTS provider behind a server-side adapter after provider, budget, consent, and retention are approved. Keep browser TTS as an accessible fallback.
