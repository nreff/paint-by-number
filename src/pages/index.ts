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

export const PAGES: ColoringPage[] = [sunset, fish, cottage, flowers, rocket, butterfly, castle, duel, siege, dragon];

export const getPage = (id: string) => PAGES.find((p) => p.id === id);
