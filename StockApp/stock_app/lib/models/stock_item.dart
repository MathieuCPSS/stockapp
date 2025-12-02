
class StockItem {
  final int? id;          // identifiant auto-généré
  final String qrCode;    // le code QR
  final String name;      // nom du produit
  final int quantity;     // quantité en stock
  final String location;  // emplacement

  StockItem({
    this.id,
    required this.qrCode,
    required this.name,
    required this.quantity,
    required this.location,
  });

  // Convertir en Map pour l'enregistrement en base
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'qrCode': qrCode,
      'name': name,
      'quantity': quantity,
      'location': location,
    };
  }

  // Reconstruire un objet StockItem depuis la base
  static StockItem fromMap(Map<String, dynamic> map) {
    return StockItem(
      id: map['id'],
      qrCode: map['qrCode'],
      name: map['name'],
      quantity: map['quantity'],
      location: map['location'],
    );
  }
}