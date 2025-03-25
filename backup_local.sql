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
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


ALTER TYPE public."TransactionType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Budget" (
    amount double precision NOT NULL,
    "categoryId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type text NOT NULL,
    id text NOT NULL,
    "endDate" timestamp(3) without time zone,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Budget" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    icon text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type text NOT NULL,
    "userId" text
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    "categoryId" text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _UserCategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserCategories" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_UserCategories" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
cm8nda1nb00020wzgu5enhawo	cm8nda1n800000wzgjswfihps	oauth	google	103064241865404270957	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Budget" (amount, "categoryId", "userId", "createdAt", "updatedAt", type, id, "endDate", name, "startDate") FROM stdin;
450000	cm8nderio00030wzgbyq1dul8	cm8nda1n800000wzgjswfihps	2025-03-24 18:42:40.601	2025-03-24 23:16:12.594	expense	cm8nezh3s00070whwqqsogrji	2025-03-31 05:00:00	Cuido	2025-03-01 05:00:00
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, color, icon, "createdAt", "updatedAt", type, "userId") FROM stdin;
cm8nderio00030wzgbyq1dul8	Cleopatra	#cc47cc	pi pi-github	2025-03-24 17:58:34.704	2025-03-24 17:58:44.713	expense	cm8nda1n800000wzgjswfihps
cm8ndfece00040wzgsdqg5jvx	Salario	#22b575	pi pi-dollar	2025-03-24 17:59:04.286	2025-03-24 17:59:07.813	income	cm8nda1n800000wzgjswfihps
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, date, amount, description, "categoryId", "userId", type) FROM stdin;
cm8ndfs4g00060wzgr0g7q8im	2025-03-24 17:59:09.269	-230000	Pixie	cm8nderio00030wzgbyq1dul8	cm8nda1n800000wzgjswfihps	expense
cm8netfc100030whwjul2vgrm	2025-03-24 18:37:40.498	1000000	Salario	cm8ndfece00040wzgsdqg5jvx	cm8nda1n800000wzgjswfihps	income
cm8neuevb00050whwy5m1xo73	2025-02-12 05:00:00	300000	Cuido	cm8nderio00030wzgbyq1dul8	cm8nda1n800000wzgjswfihps	expense
cm8nf1u7o00090whwzzx2z0eo	2025-03-24 18:44:20.782	200000	Mas pixie	cm8nderio00030wzgbyq1dul8	cm8nda1n800000wzgjswfihps	expense
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image) FROM stdin;
cm8nda1n800000wzgjswfihps	Juan David Montoya Solorzano	juandavidsolorzano73@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocK9dg2iQQy5QS_jLn89UAPmyuR9_DYUE8T3_uTu7uguLsR02f-F=s96-c
\.


--
-- Data for Name: _UserCategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserCategories" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b22fc978-f44a-4964-b920-2a7e3fa876c4	fabe3a300e8906e6230531e42e192d3f5de5854f427573e9b396f996407f1240	2025-03-24 12:51:30.286036-05	20250321191525_init	\N	\N	2025-03-24 12:51:30.241193-05	1
3b6781d2-fcbf-4705-b843-aadd89d6f7a2	3699da720264f2138f0b21fafd77a4eb02f2169f9eb4ab443bf2cf0e02c2c1cb	2025-03-24 12:51:30.287947-05	20250321194016_make_category_fields_optional	\N	\N	2025-03-24 12:51:30.286859-05	1
e46aa66d-02f8-4c67-a501-3ffb7ea1a693	7bf7c80f4c982775123711035bcad7c62e42c0fdcb48686497f165dabc843afe	2025-03-24 12:51:30.289268-05	20250321221956_update_category_model	\N	\N	2025-03-24 12:51:30.288409-05	1
8cf087e3-a95a-46ad-bc67-205f8cce98fa	91811a5538e0a8d41a092e9c0a3f6327ed6dcfdc0933dbe445277a9992c2da29	2025-03-24 12:51:30.30226-05	20250321225055_update_relations	\N	\N	2025-03-24 12:51:30.289686-05	1
06c1f0cf-d0a3-4515-9e4e-28b67d1dc35c	9ea275b521a52d91b2ed78c454a47074c2859c60eafcd285e6fd95686e9f2eaa	2025-03-24 12:51:30.304023-05	20250321225911_add_transaction_type_and_category_user_id	\N	\N	2025-03-24 12:51:30.3028-05	1
a76df349-6e57-4e4a-b7d2-e2ff256dca93	0e42e9a1bb2d9f4b5147977331039af6cbbbf862d8a4ce11d6c09f9290602cef	2025-03-24 12:51:30.315041-05	20250322140638_budget	\N	\N	2025-03-24 12:51:30.30455-05	1
b19cecee-334d-49d4-8545-da0019a6b789	842ac1b34b55c9a51980e630fe32a6b039a1604c6e8502e99de9d8319b65a75a	2025-03-24 12:51:38.417322-05	20250324175138_add_budget_dates	\N	\N	2025-03-24 12:51:38.411732-05	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Budget Budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _UserCategories _UserCategories_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserCategories"
    ADD CONSTRAINT "_UserCategories_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _UserCategories_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserCategories_B_index" ON public."_UserCategories" USING btree ("B");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Budget Budget_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Budget Budget_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _UserCategories _UserCategories_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserCategories"
    ADD CONSTRAINT "_UserCategories_A_fkey" FOREIGN KEY ("A") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserCategories _UserCategories_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserCategories"
    ADD CONSTRAINT "_UserCategories_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

