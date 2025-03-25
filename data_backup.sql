--
-- PostgreSQL database dump
--

-- Dumped from database version 14.14 (Homebrew)
-- Dumped by pg_dump version 14.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."User" (id, name, email, "emailVerified", image) VALUES ('cm8nda1n800000wzgjswfihps', 'Juan David Montoya Solorzano', 'juandavidsolorzano73@gmail.com', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocK9dg2iQQy5QS_jLn89UAPmyuR9_DYUE8T3_uTu7uguLsR02f-F=s96-c');


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES ('cm8nda1nb00020wzgu5enhawo', 'cm8nda1n800000wzgjswfihps', 'oauth', 'google', '103064241865404270957', NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Category" (id, name, color, icon, "createdAt", "updatedAt", type, "userId") VALUES ('cm8nderio00030wzgbyq1dul8', 'Cleopatra', '#cc47cc', 'pi pi-github', '2025-03-24 17:58:34.704', '2025-03-24 17:58:44.713', 'expense', 'cm8nda1n800000wzgjswfihps');
INSERT INTO public."Category" (id, name, color, icon, "createdAt", "updatedAt", type, "userId") VALUES ('cm8ndfece00040wzgsdqg5jvx', 'Salario', '#22b575', 'pi pi-dollar', '2025-03-24 17:59:04.286', '2025-03-24 17:59:07.813', 'income', 'cm8nda1n800000wzgjswfihps');


--
-- Data for Name: Budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Budget" (amount, "categoryId", "userId", "createdAt", "updatedAt", type, id, "endDate", name, "startDate") VALUES (450000, 'cm8nderio00030wzgbyq1dul8', 'cm8nda1n800000wzgjswfihps', '2025-03-24 18:42:40.601', '2025-03-24 23:16:12.594', 'expense', 'cm8nezh3s00070whwqqsogrji', '2025-03-31 05:00:00', 'Cuido', '2025-03-01 05:00:00');


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Transaction" (id, date, amount, description, "categoryId", "userId", type) VALUES ('cm8ndfs4g00060wzgr0g7q8im', '2025-03-24 17:59:09.269', -230000, 'Pixie', 'cm8nderio00030wzgbyq1dul8', 'cm8nda1n800000wzgjswfihps', 'expense');
INSERT INTO public."Transaction" (id, date, amount, description, "categoryId", "userId", type) VALUES ('cm8netfc100030whwjul2vgrm', '2025-03-24 18:37:40.498', 1000000, 'Salario', 'cm8ndfece00040wzgsdqg5jvx', 'cm8nda1n800000wzgjswfihps', 'income');
INSERT INTO public."Transaction" (id, date, amount, description, "categoryId", "userId", type) VALUES ('cm8neuevb00050whwy5m1xo73', '2025-02-12 05:00:00', 300000, 'Cuido', 'cm8nderio00030wzgbyq1dul8', 'cm8nda1n800000wzgjswfihps', 'expense');
INSERT INTO public."Transaction" (id, date, amount, description, "categoryId", "userId", type) VALUES ('cm8nf1u7o00090whwzzx2z0eo', '2025-03-24 18:44:20.782', 200000, 'Mas pixie', 'cm8nderio00030wzgbyq1dul8', 'cm8nda1n800000wzgjswfihps', 'expense');


--
-- PostgreSQL database dump complete
--

