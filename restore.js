db.getSiblingDB('perfume-store').users.aggregate([{ $out: { db: 'Monsur Ali TravelsBD', coll: 'users' } }]);
