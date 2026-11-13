import type { ColoringPage } from './types';
import { sunset } from './sunset';
import { fish } from './fish';
import { cottage } from './cottage';
import { flowers } from './flowers';
import { rocket } from './rocket';
import { butterfly } from './butterfly';

export const PAGES: ColoringPage[] = [sunset, fish, cottage, flowers, rocket, butterfly];

export const getPage = (id: string) => PAGES.find((p) => p.id === id);
