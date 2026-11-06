import asyncio
import logging
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.all_models import Preset
from app.seeds.presets_data import PRESETS_DATA

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")


async def seed_presets():
    await init_tables()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Preset))
        existing = {p.id for p in result.scalars().all()}
        
        added = 0
        for item in PRESETS_DATA:
            if item["id"] not in existing:
                preset = Preset(
                    id=item["id"],
                    category=item["category"],
                    name_en=item["name_en"],
                    name_hi=item["name_hi"],
                    description_en=item.get("description_en"),
                    description_hi=item.get("description_hi"),
                    sort_order=item.get("sort_order", 0),
                    metadata_json={},
                )
                session.add(preset)
                added += 1
        
        await session.commit()
        logger.info(f"Seeded {added} new presets. Total catalog items: {len(PRESETS_DATA)}.")


if __name__ == "__main__":
    asyncio.run(seed_presets())

