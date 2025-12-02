import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:path/path.dart';
import '../models/stock_item.dart';

class StockDatabase {
  static Future<Database> initDb() async {
    sqfliteFfiInit();
databaseFactory = databaseFactoryFfi;
    final dbPath = await getDatabasesPath();
    return openDatabase(
      join(dbPath, 'stock.db'),
      onCreate: (db, version) {
        return db.execute('''
          CREATE TABLE stock_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qrCode TEXT,
            name TEXT,
            quantity INTEGER,
            location TEXT
          )
        ''');
      },
      version: 1,
    );
  }

  static Future<void> insertItem(StockItem item) async {
    final db = await initDb();
    await db.insert('stock_items', item.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  static Future<List<StockItem>> getAllItems() async {
    final db = await initDb();
    final maps = await db.query('stock_items');
    return maps.map((map) => StockItem.fromMap(map)).toList();
  }
}
