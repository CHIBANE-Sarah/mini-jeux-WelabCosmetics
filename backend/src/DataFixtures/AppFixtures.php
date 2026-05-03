<?php

// Namespace du fichier de fixtures.
namespace App\DataFixtures;

// Classe de base des fixtures Doctrine.
use Doctrine\Bundle\FixturesBundle\Fixture;

// ObjectManager permet d'enregistrer des objets en base pendant le chargement des fixtures.
use Doctrine\Persistence\ObjectManager;

// Fixture de base générée par Symfony.
// Ici, elle ne crée pas de données particulières.
class AppFixtures extends Fixture
{
    // Méthode appelée quand on lance le chargement des fixtures.
    public function load(ObjectManager $manager): void
    {
        // Exemple généré par Symfony, laissé en commentaire.
        // Il montre comment créer une entité et la préparer pour l'enregistrement.
        // $product = new Product();
        // $manager->persist($product);

        // Exécute les enregistrements préparés.
        // Ici, aucun objet n’est persisté, donc cette fixture ne crée rien.
        $manager->flush();
    }
}