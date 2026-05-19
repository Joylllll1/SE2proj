import AIProfile from '../models/AIProfile.js';
import AISession from '../models/AISession.js';
import AppError from '../utils/AppError.js';
import {
  compactPersona,
  diffPersonaConfig,
  resolvePersonaConfig,
  sanitizePersonaInput,
} from './aiPersonaConfig.js';

function toPlainPersona(persona) {
  if (!persona) {
    return {};
  }

  if (typeof persona.toObject === 'function') {
    return compactPersona(persona.toObject());
  }

  return compactPersona(persona);
}

async function getOwnedSession(userId, sessionId) {
  const session = await AISession.findOne({ _id: sessionId, user: userId });
  if (!session) {
    throw new AppError('会话不存在', 404, 'SESSION_NOT_FOUND');
  }
  return session;
}

export async function getProfile(userId) {
  const profile = await AIProfile.findOne({ user: userId }).lean();
  const persona = compactPersona(profile?.persona || {});

  return {
    persona,
    effectivePersona: resolvePersonaConfig(persona),
  };
}

export async function updateProfile(userId, personaInput) {
  const persona = compactPersona(sanitizePersonaInput(personaInput));

  await AIProfile.findOneAndUpdate(
    { user: userId },
    { user: userId, persona },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return getProfile(userId);
}

export async function getSessionPersona(userId, sessionId) {
  const session = await getOwnedSession(userId, sessionId);
  const { effectivePersona: defaultPersona } = await getProfile(userId);
  const persona = toPlainPersona(session.aiPersona);

  return {
    persona,
    effectivePersona: resolvePersonaConfig(defaultPersona, persona),
  };
}

export async function updateSessionPersona(userId, sessionId, personaInput) {
  const session = await getOwnedSession(userId, sessionId);
  const { effectivePersona: defaultPersona } = await getProfile(userId);
  const submittedPersona = compactPersona(sanitizePersonaInput(personaInput));
  const targetPersona = resolvePersonaConfig(defaultPersona, submittedPersona);
  const overridePersona = diffPersonaConfig(targetPersona, defaultPersona);

  session.aiPersona = Object.keys(overridePersona).length > 0 ? overridePersona : undefined;
  session.updatedAt = new Date();
  await session.save();

  return {
    persona: toPlainPersona(session.aiPersona),
    effectivePersona: resolvePersonaConfig(defaultPersona, toPlainPersona(session.aiPersona)),
  };
}

export async function resolveEffectivePersona(userId, sessionOrPersonaSource = null) {
  const { effectivePersona: defaultPersona } = await getProfile(userId);

  if (!sessionOrPersonaSource) {
    return defaultPersona;
  }

  if (typeof sessionOrPersonaSource === 'string') {
    const sessionPersona = await getSessionPersona(userId, sessionOrPersonaSource);
    return sessionPersona.effectivePersona;
  }

  return resolvePersonaConfig(defaultPersona, toPlainPersona(sessionOrPersonaSource.aiPersona));
}
