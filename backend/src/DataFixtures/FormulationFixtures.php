<?php

namespace App\DataFixtures;

use App\Entity\Ingredient;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class FormulationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $session = $this->getReference('session_3', \App\Entity\Session::class);

        $ingredients = [
            ['nom' => 'Eau purifiée',      'categorie' => 'Phase Aqueuse', 'estCorrect' => true],
            ['nom' => 'Glycérine',         'categorie' => 'Phase Aqueuse', 'estCorrect' => true],
            ['nom' => 'Alcool',            'categorie' => 'Phase Aqueuse', 'estCorrect' => false],
            ['nom' => 'Huile de Jojoba',   'categorie' => 'Phase Grasse',  'estCorrect' => true],
            ['nom' => 'Beurre de Karité',  'categorie' => 'Phase Grasse',  'estCorrect' => false],
            ['nom' => 'Huile Minérale',    'categorie' => 'Phase Grasse',  'estCorrect' => false],
            ['nom' => 'Acide Hyaluronique','categorie' => 'Actifs',        'estCorrect' => true],
            ['nom' => 'Vitamine C',        'categorie' => 'Actifs',        'estCorrect' => false],
            ['nom' => 'Niacinamide',       'categorie' => 'Actifs',        'estCorrect' => true],
            ['nom' => 'Lavande',           'categorie' => 'Parfum',        'estCorrect' => true],
            ['nom' => 'Rose',              'categorie' => 'Parfum',        'estCorrect' => false],
            ['nom' => 'Agrumes',           'categorie' => 'Parfum',        'estCorrect' => false],
        ];

        foreach ($ingredients as $i) {
            $ingredient = new Ingredient();
            $ingredient->setNom($i['nom']);
            $ingredient->setCategorie($i['categorie']);
            $ingredient->setEstCorrect($i['estCorrect']);
            $ingredient->setSession($session);
            $manager->persist($ingredient);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [SessionFixtures::class];
    }
}