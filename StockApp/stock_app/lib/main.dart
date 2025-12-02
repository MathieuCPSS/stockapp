import 'package:flutter/material.dart';
import 'models/stock_item.dart';
import 'database/stock_db.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // On insère un item fictif au démarrage
  final testItem = StockItem(
    qrCode: 'QR-DEMO-001',
    name: 'Boîte de vis M4',
    quantity: 50,
    location: 'Étagère B2',
  );

  await StockDatabase.insertItem(testItem);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'StockApp',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const StockListPage(),
    );
  }
}

class StockListPage extends StatefulWidget {
  const StockListPage({super.key});

  @override
  State<StockListPage> createState() => _StockListPageState();
}

class _StockListPageState extends State<StockListPage> {
  List<StockItem> _items = [];

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    final items = await StockDatabase.getAllItems();
    setState(() {
      _items = items;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventaire'),
      ),
      body: _items.isEmpty
          ? const Center(child: Text('Aucun article en stock'))
          : ListView.builder(
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                return ListTile(
                  leading: const Icon(Icons.qr_code),
                  title: Text(item.name),
                  subtitle: Text(
                      '${item.qrCode} • ${item.quantity} pcs à ${item.location}'),
                );
              },
            ),
    );
  }
}
