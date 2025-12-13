from typing import List

SEED_SUPPLIERS = [
    {
        "code": "A",
        "name": "A Corp.",
        "full_name": "The Head's Administrative Wing",
        "description": "Directly run by The Head. Manages all other Wings and handles Singularity and technology patents, along with other important aspects of City government.",
        "address": "District 1 - The Head's Nest",
        "contact_email": "procurement@acorp.city",
        "contact_phone": "+1-HEAD-001",
    },
    {
        "code": "B",
        "name": "B Corp.",
        "full_name": "The Eye's Surveillance Wing",
        "description": "Directly run by The Eye. Regulates the Singularities of other Wings and monitors the City with an all-encompassing surveillance network.",
        "address": "District 2 - The Eye's Nest",
        "contact_email": "oversight@bcorp.city",
        "contact_phone": "+1-EYE-002",
    },
    {
        "code": "C",
        "name": "C Corp.",
        "full_name": "The Claw's Military Wing",
        "description": "Directly run by The Claw. Uses military agents to eliminate threats as appointed by the Head, and punish culprits of tax evasion and patent infringement.",
        "address": "District 3 - The Claw's Nest",
        "contact_email": "enforcement@ccorp.city",
        "contact_phone": "+1-CLAW-003",
    },
    {
        "code": "D",
        "name": "D Corp.",
        "full_name": "General Distribution Wing",
        "description": "Handles general distribution and logistics across the City's districts. Known for reliable supply chain management.",
        "address": "District 4 - Nest D",
        "contact_email": "logistics@dcorp.city",
        "contact_phone": "+1-DIST-004",
    },
    {
        "code": "E",
        "name": "E Corp.",
        "full_name": "Energy Systems Wing",
        "description": "One of the major parties involved in the Smoke War. Specializes in industrial energy solutions and power infrastructure.",
        "address": "District 5 - Nest E",
        "contact_email": "power@ecorp.city",
        "contact_phone": "+1-ENRG-005",
    },
    {
        "code": "F",
        "name": "F Corp.",
        "full_name": "Manufacturing Wing",
        "description": "One of the major parties involved in the Smoke War. Handles large-scale manufacturing and production facilities.",
        "address": "District 6 - Nest F",
        "contact_email": "production@fcorp.city",
        "contact_phone": "+1-FACT-006",
    },
    {
        "code": "G",
        "name": "G Corp.",
        "full_name": "Gravity Technology Wing",
        "description": "Its Singularity revolves around spheres which can manipulate gravity. Provides anti-gravity equipment and transportation solutions.",
        "address": "District 7 - Nest G",
        "contact_email": "gravity@gcorp.city",
        "contact_phone": "+1-GRAV-007",
    },
    {
        "code": "H",
        "name": "H Corp.",
        "full_name": "New Wing (Rebuilt)",
        "description": "The new H Corp that replaced the former Wing after its destruction. Specializes in construction and infrastructure rebuilding.",
        "address": "District 8 - Nest H (Rebuilt)",
        "contact_email": "rebuild@hcorp.city",
        "contact_phone": "+1-HAVEN-008",
    },
    {
        "code": "I",
        "name": "I Corp.",
        "full_name": "Infrastructure Wing",
        "description": "One of the major parties involved in the Smoke War. Manages City infrastructure, utilities, and public works.",
        "address": "District 9 - Nest I",
        "contact_email": "infra@icorp.city",
        "contact_phone": "+1-INFRA-009",
    },
    {
        "code": "J",
        "name": "J Corp.",
        "full_name": "The Nest of Gambling",
        "description": "Its Nest is known as the 'Nest of Gambling'. The singularity utilizes wishes and locks, dealing with probability and fortune.",
        "address": "District 10 - Nest J (Nest of Gambling)",
        "contact_email": "fortune@jcorp.city",
        "contact_phone": "+1-LUCK-010",
    },
    {
        "code": "K",
        "name": "K Corp.",
        "full_name": "Healing Wing",
        "description": "Their Singularity revolves around healing wounds and injuries quickly, using a delicious green substance. Provides medical supplies and treatments.",
        "address": "District 11 - Nest K",
        "contact_email": "healing@kcorp.city",
        "contact_phone": "+1-HEAL-011",
    },
    {
        "code": "L",
        "name": "L Corp.",
        "full_name": "Energy Wing",
        "description": "Operated as an energy supplier with a Singularity allowing for sustainable energy production from Abnormalities. Recently underwent major restructuring after the White Nights and Dark Days incident.",
        "address": "District 12 - Nest L",
        "contact_email": "legacy@lcorp.city",
        "contact_phone": "+1-LOBO-012",
    },
    {
        "code": "M",
        "name": "M Corp.",
        "full_name": "Moonlight Stone Wing",
        "description": "Known as MDM Enterprise. Its Singularity revolves around the production of 'moonlight stones', which protect their user from psychological attacks.",
        "address": "District 13 - Nest M",
        "contact_email": "moonlight@mcorp.city",
        "contact_phone": "+1-MOON-013",
    },
    {
        "code": "N",
        "name": "N Corp.",
        "full_name": "Taboo Enforcement Wing",
        "description": "Regulates the Backstreets with certain restrictions known as 'Taboos'. Sends special Fixers called Taboo Hunters to track down violators.",
        "address": "District 14 - Nest N",
        "contact_email": "purity@ncorp.city",
        "contact_phone": "+1-TABOO-014",
    },
    {
        "code": "O",
        "name": "O Corp.",
        "full_name": "Optical Systems Wing",
        "description": "Specializes in optical technology, lenses, and visual enhancement equipment. Works closely with B Corp on surveillance systems.",
        "address": "District 15 - Nest O",
        "contact_email": "optics@ocorp.city",
        "contact_phone": "+1-OPTIC-015",
    },
    {
        "code": "P",
        "name": "P Corp.",
        "full_name": "Pharmaceutical Wing",
        "description": "Produces pharmaceuticals and chemical compounds. Often works with K Corp on medical solutions.",
        "address": "District 16 - Nest P",
        "contact_email": "pharma@pcorp.city",
        "contact_phone": "+1-PHARM-016",
    },
    {
        "code": "Q",
        "name": "Q Corp.",
        "full_name": "Talisman Wing",
        "description": "Works with Talismans in mysterious ways. Deals in spiritual protection items and mystical artifacts.",
        "address": "District 17 - Nest Q",
        "contact_email": "talismans@qcorp.city",
        "contact_phone": "+1-TALIS-017",
    },
    {
        "code": "R",
        "name": "R Corp.",
        "full_name": "Private Military Wing",
        "description": "Markets itself as a private military company with elite combatants. The true nature of its Singularity is cloning soldiers through 'Hatcheries'.",
        "address": "District 18 - Nest R",
        "contact_email": "military@rcorp.city",
        "contact_phone": "+1-ARMY-018",
    },
    {
        "code": "S",
        "name": "S Corp.",
        "full_name": "Agriculture Wing",
        "description": "Known as Salpippyeo Agroindustries. Deals with agriculture and food industry. The name combines Korean words for flesh, blood, and bone.",
        "address": "District 19 - Nest S",
        "contact_email": "harvest@scorp.city",
        "contact_phone": "+1-AGRI-019",
    },
    {
        "code": "T",
        "name": "T Corp.",
        "full_name": "Time Wing",
        "description": "Known as TimeTrack. Its Singularity revolves around controlling time, mainly by locally speeding up or slowing down time.",
        "address": "District 20 - Nest T",
        "contact_email": "timetrack@tcorp.city",
        "contact_phone": "+1-TIME-020",
    },
    {
        "code": "U",
        "name": "U Corp.",
        "full_name": "Maritime Wing",
        "description": "Specializes in Resonance-tuning Fork and related products. Located on the Great Lake with assets on giant seafaring vessels.",
        "address": "District 21 - Nest U (Great Lake)",
        "contact_email": "maritime@ucorp.city",
        "contact_phone": "+1-NAVY-021",
    },
    {
        "code": "V",
        "name": "V Corp.",
        "full_name": "Valorous Wing",
        "description": "Home to prestigious Fixer offices. Known for supporting independent contractors and maintaining high-class facilities.",
        "address": "District 22 - Nest V",
        "contact_email": "valor@vcorp.city",
        "contact_phone": "+1-VALOR-022",
    },
    {
        "code": "W",
        "name": "W Corp.",
        "full_name": "Transportation Wing",
        "description": "Known as WARP Corp. Advertises near-instantaneous teleportation for transportation. Actual Singularity includes 'save point' restoration technology.",
        "address": "District 23 - Nest W",
        "contact_email": "warp@wcorp.city",
        "contact_phone": "+1-WARP-023",
    },
    {
        "code": "X",
        "name": "X Corp.",
        "full_name": "Alloy Wing",
        "description": "Specialized in extremely durable alloy as their singularity. Products are kept under strict restriction due to military applications.",
        "address": "District 24 - Nest X",
        "contact_email": "alloys@xcorp.city",
        "contact_phone": "+1-ALLOY-024",
    },
    {
        "code": "Y",
        "name": "Y Corp.",
        "full_name": "Yield Wing",
        "description": "Focuses on resource optimization and yield maximization. Provides efficiency consulting and optimization technology.",
        "address": "District 25 - Nest Y",
        "contact_email": "yield@ycorp.city",
        "contact_phone": "+1-YIELD-025",
    },
    {
        "code": "Z",
        "name": "Z Corp.",
        "full_name": "Zero Point Wing",
        "description": "The final Wing. Deals with end-of-life services, waste management, and zero-point energy research.",
        "address": "District 26 - Nest Z",
        "contact_email": "zero@zcorp.city",
        "contact_phone": "+1-ZERO-026",
    },
]


def get_all_suppliers(db: dict) -> List[dict]:
    cursor = db["cursor"]
    cursor.execute("SELECT * FROM suppliers ORDER BY id")
    return cursor.fetchall()


def get_active_suppliers(db: dict) -> List[dict]:
    cursor = db["cursor"]
    cursor.execute("SELECT id, code, name, full_name FROM suppliers ORDER BY code")
    return cursor.fetchall()


def get_supplier_by_id(db: dict, supplier_id: int) -> dict | None:
    cursor = db["cursor"]
    cursor.execute("SELECT * FROM suppliers WHERE id = %s", (supplier_id,))
    return cursor.fetchone()


def seed_suppliers(db: dict) -> dict:
    cursor = db["cursor"]
    cursor.execute("SELECT 1 FROM suppliers LIMIT 1")
    if cursor.fetchone():
        return {"message": "Suppliers already seeded"}
    for s in SEED_SUPPLIERS:
        cursor.execute(
            """
            INSERT INTO suppliers (code, name, full_name, description, address, contact_email, contact_phone)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                s["code"],
                s["name"],
                s["full_name"],
                s.get("description"),
                s["address"],
                s.get("contact_email"),
                s.get("contact_phone"),
            ),
        )
    return {"message": f"Seeded {len(SEED_SUPPLIERS)} suppliers (A-Z Corps)"}
