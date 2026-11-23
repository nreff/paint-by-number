import type { ColoringPage } from './types';
import { sunset } from './sunset';
import { fish } from './fish';
import { cottage } from './cottage';
import { flowers } from './flowers';
import { rocket } from './rocket';
import { butterfly } from './butterfly';
import { castle } from './castle';
import { duel } from './duel';
import { siege } from './siege';
import { dragon } from './dragon';
import { horses } from './horses';
import { owl } from './owl';
import { retriever } from './retriever';
import { mandala } from './mandala';
import { schnauzer } from './schnauzer';
import { taekwondo } from './taekwondo';
import { teaparty } from './teaparty';

export const PAGES: ColoringPage[] = [sunset, fish, cottage, flowers, rocket, butterfly, castle, duel, siege, dragon, horses, owl, retriever, schnauzer, taekwondo, teaparty, mandala];

export const getPage = (id: string) => PAGES.find((p) => p.id === id);
